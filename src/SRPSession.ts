/*
 * Copyright (C) 2019-2020 Tyler Swann - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
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
    cipherText: SjclCipherEncrypted;
    checksum: string;
}

class SRPClientSession
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
                console.log(cipherText);
                console.log((typeof cipherText));
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

export class SRPServerSession
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
    private static sessions: Map<string, SRPServerSession | SRPClientSession> = new Map();

    static newClientSession(password: string, model: SRPServerModel): Promise<SRPClientSession>
    {
        return new Promise((resolve, reject) => {
            try
            {
                if (this.sessions.has(model.username))
                {
                    reject(`SRP client session for user "${model.username}" already exists. Please destroy session first!`);
                    return;
                }
                const client = new SRPClientSession(password, model);
                SRPSession.sessions.set(model.username, client);
                resolve(client);
            }
            catch (e) { reject(e); }
        });
    }

    static newServerSession(model: SRPClientModel): Promise<SRPServerSession>
    {
        return new Promise((resolve, reject) => {
            if (this.sessions.has(model.username))
            {
                reject(`SRP server session for user "${model.username}" already exists. Please destroy session first!`);
                return;
            }
            const server = new SRPServerSession(model);
            SRPSession.sessions.set(model.username, server);
            resolve(server);
        });
    }

    static resumeServerSession(username: string): Promise<SRPServerSession>
    {
        return new Promise((resolve, reject) => {
            if (!this.sessions.has(username))
                reject(`Server session with user '${username}' not found`);
            else if (!SRPServerSession.isSRPServerSession(this.sessions.get(username)))
                reject(`Server session with user '${username}' is client session!`);
            else
                resolve(this.sessions.get(username) as SRPServerSession);
        });
    }

    static resumeClientSession(username: string): Promise<SRPClientSession>
    {
        return new Promise((resolve, reject) => {
            if (!this.sessions.has(username))
                reject(`Client session with user '${username}' not found`);
            else if (!SRPClientSession.isSRPClientSession(this.sessions.get(username)))
                reject(`Client session with user '${username}' is server session!`);
            else
                resolve(this.sessions.get(username) as SRPClientSession);
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

    static hasSession(username: string): boolean
    {
        return this.sessions.has(username);
    }

    static destroySession(username: string)
    {
        if (this.sessions.has(username))
            this.sessions.delete(username);
    }
}


export default SRPSession;
