/*
 * MIT License
 *
 * Copyright (c) 2020 Tyler Swann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * Written by Tyler Swann <tyler.swann94@gmail.com>
 * on 09/08/2020 at 5:19 PM
 */

import SRP, { SRPGroup, HashFunction, SRPKeySize, BinaryNumber, HASH } from './SRP';
import { SjclCipherEncrypted } from "../lib/sjcl";


export interface SRPGroupPolicy
{
    size: SRPKeySize;
    hash: HashFunction;
}

export interface SRPClientModel
{
    username: string;
    verifier: string;
    salt: string;
    policy: SRPGroupPolicy;
}

export interface SRPServerModel extends SRPClientModel
{
    publicValue: string;
}

export interface SRPAuthenticationBundle
{
    username: string;
    publicValue: string;
    cipherText: string;
    checksum: string;
}

abstract class SRPSessionImpl
{
    abstract preMasterKey: string | null;

    encrypt(data: string): Promise<string>
    {
        return new Promise((resolve, reject) => {
            if (this.preMasterKey == null)
            {
                reject("SRPSessionImpl: Cannot encrypt data using null preMasterKey!");
                return;
            }
            try
            {
                const cipherText = SRP.encrypt(this.preMasterKey, data);
                resolve(cipherText);
            }
            catch (e) { reject(e); }
        });
    }

    decrypt(data: string): Promise<string>
    {
        return new Promise((resolve, reject) => {
            if (this.preMasterKey == null)
            {
                reject("SRPSessionImpl: Cannot decrypt data using null preMasterKey!\n Ensure client has been properly authenticated!");
                return;
            }
            try
            {
                const plainText = SRP.decrypt(this.preMasterKey, data);
                resolve(plainText);
            }
            catch (e) { reject(e); }
        });
    }
}

export class SRPClientSession extends SRPSessionImpl
{
    private readonly I: string;
    private readonly P: string;
    private readonly s: BinaryNumber;
    private readonly a: BinaryNumber;
    private readonly A: BinaryNumber;
    private readonly B: BinaryNumber;
    private readonly group: SRPGroup;
    public readonly preMasterKey: string;
    public readonly publicValue: string;
    private readonly IS_SRP_CLIENT_SESSION = "IS_SRP_CLIENT_SESSION";

    constructor(password: string, model: SRPServerModel)
    {
        super();
        this.I = model.username;
        this.P = password;
        this.s = new BinaryNumber(model.salt);
        this.group = SRP.Groups.customSRPGroup(model.policy.size, model.policy.hash);
        this.a = SRP.random(32);
        this.A = SRP.makeA(this.group, this.a);
        this.publicValue = this.A.hex();
        this.B = new BinaryNumber(model.publicValue);
        const pms = SRP.makeClientPreMasterSecret(this.I, this.P, this.group, this.s, this.B, this.a);
        this.preMasterKey = pms.S.hex();
    }

    makeAuthenticationBundle(): Promise<SRPAuthenticationBundle>
    {
        return new Promise((resolve, reject) => {
            try
            {
                const secret = SRP.random(32).hex();
                const cipherText = SRP.encrypt(this.preMasterKey, secret);
                const checksum = HASH(secret, this.group.hash).hex();
                const bundle: SRPAuthenticationBundle = {
                    username: this.I,
                    publicValue: this.A.hex(),
                    cipherText: cipherText,
                    checksum: checksum
                };
                resolve(bundle);
            }
            catch (e) { reject(e); }
        });
    }

    static isSRPClientSession(obj: any)
    {
        return typeof obj === "object" && obj.hasOwnProperty("IS_SRP_CLIENT_SESSION") && obj.IS_SRP_CLIENT_SESSION === "IS_SRP_CLIENT_SESSION";
    }
}

export class SRPServerSession extends SRPSessionImpl
{
    private readonly I: string;
    private readonly b: BinaryNumber;
    private readonly B: BinaryNumber;
    private readonly group: SRPGroup;
    private readonly s: BinaryNumber;
    private readonly v: BinaryNumber;
    public preMasterKey: string | null = null;
    private readonly publicValue: string;
    public readonly model: SRPServerModel;
    private readonly IS_SRP_SERVER_SESSION = "IS_SRP_SERVER_SESSION";

    constructor(model: SRPClientModel)
    {
        super();
        this.I = model.username;
        this.s = new BinaryNumber(model.salt);
        this.b = SRP.random(32);
        this.v = new BinaryNumber(model.verifier);
        this.group = SRP.Groups.customSRPGroup(model.policy.size, model.policy.hash);
        this.B = SRP.makeB(this.group, this.s, this.v, this.b);
        this.publicValue = this.B.hex();
        this.model = {
            username: model.username,
            verifier: model.verifier,
            salt: model.salt,
            publicValue: this.B.hex(),
            policy: model.policy
        };
    }

    authenticateClient(bundle: SRPAuthenticationBundle): Promise<boolean>
    {
        return new Promise((resolve) => {
            try
            {
                const pms = SRP.makeServerPreMasterSecret(new BinaryNumber(bundle.publicValue), this.v, this.s, this.group, this.b);
                this.preMasterKey = pms.S.hex();
                const decrypted = SRP.decrypt(this.preMasterKey, bundle.cipherText);
                const checksum = HASH(decrypted, this.group.hash).hex();
                resolve(checksum === bundle.checksum);
            }
            catch (e) { resolve(false); }
        });
    }

    static isSRPServerSession(obj: any)
    {
        return typeof obj === "object" && obj.hasOwnProperty("IS_SRP_SERVER_SESSION") && obj.IS_SRP_SERVER_SESSION === "IS_SRP_SERVER_SESSION";
    }
}

class SRPSession
{
    private static clientSessions: Map<string, SRPClientSession> = new Map();
    private static serverSessions: Map<string, SRPServerSession> = new Map();

    static newClientSession(password: string, model: SRPServerModel): Promise<SRPClientSession>
    {
        return new Promise((resolve, reject) => {
            try
            {
                if (this.clientSessions.has(model.username))
                {
                    reject(`SRP client session for user "${model.username}" already exists. Please destroy session first!`);
                    return;
                }
                const client = new SRPClientSession(password, model);
                SRPSession.clientSessions.set(model.username, client);
                resolve(client);
            }
            catch (e) { reject(e); }
        });
    }

    static newServerSession(model: SRPClientModel): Promise<SRPServerSession>
    {
        return new Promise((resolve, reject) => {
            if (this.serverSessions.has(model.username))
            {
                reject(`SRP server session for user "${model.username}" already exists. Please destroy session first!`);
                return;
            }
            const server = new SRPServerSession(model);
            SRPSession.serverSessions.set(model.username, server);
            resolve(server);
        });
    }

    static resumeServerSession(username: string): Promise<SRPServerSession>
    {
        return new Promise((resolve, reject) => {
            if (!this.serverSessions.has(username))
                reject(`Server session with user '${username}' not found`);
            else if (!SRPServerSession.isSRPServerSession(this.serverSessions.get(username)))
                reject(`Server session with user '${username}' is client session!`);
            else
                resolve(this.serverSessions.get(username) as SRPServerSession);
        });
    }

    static resumeClientSession(username: string): Promise<SRPClientSession>
    {
        return new Promise((resolve, reject) => {
            if (!this.clientSessions.has(username))
                reject(`Client session with user '${username}' not found`);
            else if (!SRPClientSession.isSRPClientSession(this.clientSessions.get(username)))
                reject(`Client session with user '${username}' is server session!`);
            else
                resolve(this.clientSessions.get(username));
        });
    }

    static registerNewClient(username: string, password: string, policy?: SRPGroupPolicy): Promise<SRPClientModel>
    {
        return new Promise((resolve, reject) => {
            try
            {
                const s = SRP.random(32);
                const gPolicy = policy == null ? SRPSession.defaultGroupPolicy() : policy;
                const group = SRP.Groups.customSRPGroup(gPolicy.size, gPolicy.hash);
                const v = SRP.makeVerifier(username, password, s, group);
                const model: SRPClientModel = {
                    username: username,
                    verifier: v.hex(),
                    salt: s.hex(),
                    policy: gPolicy
                };
                resolve(model);
            }
            catch (e) { reject(e); }
        });
    }

    static defaultGroupPolicy(): SRPGroupPolicy
    {
        const group = SRP.Groups.get(2048);
        if (group == null)
            throw new Error("Invalid SRP group key size!");
        return {
            size: group.size,
            hash: "sha256"
        };
    }

    static destroyClientSession(username: string)
    {
        if (this.clientSessions.has(username))
            this.clientSessions.delete(username);
    }

    static destroyServerSession(username: string)
    {
        if (this.serverSessions.has(username))
            this.serverSessions.delete(username);
    }

    static hasServerSession(username: string): boolean
    {
        return this.serverSessions.has(username);
    }

    static hasClientSession(username: string): boolean
    {
        return this.clientSessions.has(username);
    }
}


export default SRPSession;
