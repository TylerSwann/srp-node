"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRPServerSession = exports.SRPClientSession = void 0;
const SRP_1 = __importStar(require("./SRP"));
class SRPSessionImpl {
    encrypt(data) {
        return new Promise((resolve, reject) => {
            if (this.preMasterKey == null) {
                reject("SRPSessionImpl: Cannot encrypt data using null preMasterKey!");
                return;
            }
            try {
                const cipherText = SRP_1.default.encrypt(this.preMasterKey, data);
                resolve(cipherText);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    decrypt(data) {
        return new Promise((resolve, reject) => {
            if (this.preMasterKey == null) {
                reject("SRPSessionImpl: Cannot decrypt data using null preMasterKey!\n Ensure client has been properly authenticated!");
                return;
            }
            try {
                const plainText = SRP_1.default.decrypt(this.preMasterKey, data);
                resolve(plainText);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
class SRPClientSession extends SRPSessionImpl {
    constructor(password, model) {
        super();
        this.IS_SRP_CLIENT_SESSION = "IS_SRP_CLIENT_SESSION";
        this.I = model.username;
        this.P = password;
        this.s = new SRP_1.BinaryNumber(model.salt);
        this.group = SRP_1.default.Groups.customSRPGroup(model.policy.size, model.policy.hash);
        this.a = SRP_1.default.random(32);
        this.A = SRP_1.default.makeA(this.group, this.a);
        this.publicValue = this.A.hex();
        this.B = new SRP_1.BinaryNumber(model.publicValue);
        const pms = SRP_1.default.makeClientPreMasterSecret(this.I, this.P, this.group, this.s, this.B, this.a);
        this.preMasterKey = pms.S.hex();
    }
    makeAuthenticationBundle() {
        return new Promise((resolve, reject) => {
            try {
                const secret = SRP_1.default.random(32).hex();
                const cipherText = SRP_1.default.encrypt(this.preMasterKey, secret);
                const checksum = SRP_1.HASH(secret, this.group.hash).hex();
                const bundle = {
                    username: this.I,
                    publicValue: this.A.hex(),
                    cipherText: cipherText,
                    checksum: checksum
                };
                resolve(bundle);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    static isSRPClientSession(obj) {
        return typeof obj === "object" && obj.hasOwnProperty("IS_SRP_CLIENT_SESSION") && obj.IS_SRP_CLIENT_SESSION === "IS_SRP_CLIENT_SESSION";
    }
}
exports.SRPClientSession = SRPClientSession;
class SRPServerSession extends SRPSessionImpl {
    constructor(model) {
        super();
        this.preMasterKey = null;
        this.IS_SRP_SERVER_SESSION = "IS_SRP_SERVER_SESSION";
        this.I = model.username;
        this.s = new SRP_1.BinaryNumber(model.salt);
        this.b = SRP_1.default.random(32);
        this.v = new SRP_1.BinaryNumber(model.verifier);
        this.group = SRP_1.default.Groups.customSRPGroup(model.policy.size, model.policy.hash);
        this.B = SRP_1.default.makeB(this.group, this.s, this.v, this.b);
        this.publicValue = this.B.hex();
        this.model = {
            username: model.username,
            verifier: model.verifier,
            salt: model.salt,
            publicValue: this.B.hex(),
            policy: model.policy
        };
    }
    authenticateClient(bundle) {
        return new Promise((resolve) => {
            try {
                const pms = SRP_1.default.makeServerPreMasterSecret(new SRP_1.BinaryNumber(bundle.publicValue), this.v, this.s, this.group, this.b);
                this.preMasterKey = pms.S.hex();
                const decrypted = SRP_1.default.decrypt(this.preMasterKey, bundle.cipherText);
                const checksum = SRP_1.HASH(decrypted, this.group.hash).hex();
                resolve(checksum === bundle.checksum);
            }
            catch (e) {
                resolve(false);
            }
        });
    }
    static isSRPServerSession(obj) {
        return typeof obj === "object" && obj.hasOwnProperty("IS_SRP_SERVER_SESSION") && obj.IS_SRP_SERVER_SESSION === "IS_SRP_SERVER_SESSION";
    }
}
exports.SRPServerSession = SRPServerSession;
class SRPSession {
    static newClientSession(password, model) {
        return new Promise((resolve, reject) => {
            try {
                if (this.clientSessions.has(model.username)) {
                    reject(`SRP client session for user "${model.username}" already exists. Please destroy session first!`);
                    return;
                }
                const client = new SRPClientSession(password, model);
                SRPSession.clientSessions.set(model.username, client);
                resolve(client);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    static newServerSession(model) {
        return new Promise((resolve, reject) => {
            if (this.serverSessions.has(model.username)) {
                reject(`SRP server session for user "${model.username}" already exists. Please destroy session first!`);
                return;
            }
            const server = new SRPServerSession(model);
            SRPSession.serverSessions.set(model.username, server);
            resolve(server);
        });
    }
    static resumeServerSession(username) {
        return new Promise((resolve, reject) => {
            if (!this.serverSessions.has(username))
                reject(`Server session with user '${username}' not found`);
            else if (!SRPServerSession.isSRPServerSession(this.serverSessions.get(username)))
                reject(`Server session with user '${username}' is client session!`);
            else
                resolve(this.serverSessions.get(username));
        });
    }
    static resumeClientSession(username) {
        return new Promise((resolve, reject) => {
            if (!this.clientSessions.has(username))
                reject(`Client session with user '${username}' not found`);
            else if (!SRPClientSession.isSRPClientSession(this.clientSessions.get(username)))
                reject(`Client session with user '${username}' is server session!`);
            else
                resolve(this.clientSessions.get(username));
        });
    }
    static registerNewClient(username, password, policy) {
        return new Promise((resolve, reject) => {
            try {
                const s = SRP_1.default.random(32);
                const gPolicy = policy == null ? SRPSession.defaultGroupPolicy() : policy;
                const group = SRP_1.default.Groups.customSRPGroup(gPolicy.size, gPolicy.hash);
                const v = SRP_1.default.makeVerifier(username, password, s, group);
                const model = {
                    username: username,
                    verifier: v.hex(),
                    salt: s.hex(),
                    policy: gPolicy
                };
                resolve(model);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    static defaultGroupPolicy() {
        const group = SRP_1.default.Groups.get(2048);
        if (group == null)
            throw new Error("Invalid SRP group key size!");
        return {
            size: group.size,
            hash: "sha256"
        };
    }
    static destroyClientSession(username) {
        if (this.clientSessions.has(username))
            this.clientSessions.delete(username);
    }
    static destroyServerSession(username) {
        if (this.serverSessions.has(username))
            this.serverSessions.delete(username);
    }
    static hasServerSession(username) {
        return this.serverSessions.has(username);
    }
    static hasClientSession(username) {
        return this.clientSessions.has(username);
    }
}
SRPSession.clientSessions = new Map();
SRPSession.serverSessions = new Map();
exports.default = SRPSession;
