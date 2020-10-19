"use strict";
/*
 * Copyright (C) 2019-2020 Tyler Swann - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Tyler Swann <tyler.swann94@gmail.com>
 * on 09/02/2020 at 10:36 AM
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HASH = exports.BITS = exports.PAD = exports.CONCAT = exports.BinaryNumber = void 0;
/*
 * Copyright (C) 2019-2020 Tyler Swann - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Tyler Swann <tyler.swann94@gmail.com>
 * on 08/19/2020 at 1:58 PM
 */
const sjcl_1 = __importDefault(require("../lib/sjcl"));
const buffer_1 = require("buffer/");
const bignumber_js_1 = require("bignumber.js");
const isNode = (typeof window == "undefined") && (typeof process != "undefined") && process != null;
class BinaryNumber {
    constructor(value) {
        // private readonly bnValue: sjcl.BigNumber;
        this.IS_BINARY_NUMBER = true;
        this.value = BinaryNumber.parse(value);
    }
    plus(bn) {
        const value = BinaryNumber.parse(bn);
        return new BinaryNumber(this.value.plus(value));
    }
    minus(bn) {
        const value = BinaryNumber.parse(bn);
        return new BinaryNumber(this.value.minus(value));
    }
    times(bn) {
        const value = BinaryNumber.parse(bn);
        return new BinaryNumber(this.value.times(value));
    }
    power(bn) {
        const value = BinaryNumber.parse(bn);
        return new BinaryNumber(this.value.exponentiatedBy(value));
    }
    powerModulus(bn, mod) {
        const value = BinaryNumber.parse(bn);
        const modulus = BinaryNumber.parse(mod);
        return new BinaryNumber(this.value.exponentiatedBy(value, modulus));
    }
    mod(bn) {
        const value = BinaryNumber.parse(bn);
        return new BinaryNumber(this.value.mod(value));
    }
    compareTo(bn) {
        const value = BinaryNumber.parse(bn);
        return this.value.comparedTo(value);
    }
    concat(bn) {
        const a1 = this.hex();
        const a2 = new BinaryNumber(bn).hex();
        return new BinaryNumber(BinaryNumber.parse(a1 + a2));
    }
    hex() { return this.value.toString(16); }
    toBuffer() { return buffer_1.Buffer.from(this.toArray()); }
    toArray() {
        const bn = new sjcl_1.default.bn(this.hex());
        return bn.toBits();
    }
    toString() { return this.hex(); }
    toNumber() {
        return parseInt(this.hex(), 16);
    }
    static parse(value) {
        let bn;
        if (typeof value === "string")
            bn = new bignumber_js_1.BigNumber(value, 16);
        else if (typeof value === "number")
            bn = new bignumber_js_1.BigNumber(value, 10);
        else if (buffer_1.Buffer.isBuffer(value))
            bn = new bignumber_js_1.BigNumber(value.toString("hex"), 16);
        else if (Array.isArray(value))
            bn = new bignumber_js_1.BigNumber(sjcl_1.default.codec.hex.fromBits(value), 16);
        else if (bignumber_js_1.BigNumber.isBigNumber(value))
            bn = value;
        else if (BinaryNumber.isBinaryNumber(value))
            bn = new bignumber_js_1.BigNumber(value.hex(), 16);
        else
            throw new Error("Invalid initial value supplied to BinaryNumber");
        return bn;
    }
    static isBinaryNumber(num) {
        const keys = Object.keys(num);
        return keys.includes("value") &&
            keys.includes("IS_BINARY_NUMBER") &&
            num.IS_BINARY_NUMBER != null &&
            num.IS_BINARY_NUMBER;
    }
}
exports.BinaryNumber = BinaryNumber;
class Groups {
    static initialize() {
        if (Groups.hasInitialized)
            return;
        Groups.hasInitialized = true;
        const g1024 = 2;
        const N1024 = "EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C" +
            "9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE4" +
            "8E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B29" +
            "7BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9A" +
            "FD5138FE8376435B9FC61D2FC0EB06E3";
        const g1536 = 2;
        const N1536 = "9DEF3CAFB939277AB1F12A8617A47BBBDBA51DF499AC4C80BEEEA961" +
            "4B19CC4D5F4F5F556E27CBDE51C6A94BE4607A291558903BA0D0F843" +
            "80B655BB9A22E8DCDF028A7CEC67F0D08134B1C8B97989149B609E0B" +
            "E3BAB63D47548381DBC5B1FC764E3F4B53DD9DA1158BFD3E2B9C8CF5" +
            "6EDF019539349627DB2FD53D24B7C48665772E437D6C7F8CE442734A" +
            "F7CCB7AE837C264AE3A9BEB87F8A2FE9B8B5292E5A021FFF5E91479E" +
            "8CE7A28C2442C6F315180F93499A234DCF76E3FED135F9BB";
        const g2048 = 2;
        const N2048 = "AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC319294" +
            "3DB56050A37329CBB4A099ED8193E0757767A13DD52312AB4B03310D" +
            "CD7F48A9DA04FD50E8083969EDB767B0CF6095179A163AB3661A05FB" +
            "D5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF74" +
            "7359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A" +
            "436C6481F1D2B9078717461A5B9D32E688F87748544523B524B0D57D" +
            "5EA77A2775D2ECFA032CFBDBF52FB3786160279004E57AE6AF874E73" +
            "03CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DBFBB6" +
            "94B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F" +
            "9E4AFF73";
        const g3072 = 5;
        const N3072 = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08" +
            "8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B" +
            "302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9" +
            "A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6" +
            "49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8" +
            "FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D" +
            "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C" +
            "180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718" +
            "3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D" +
            "04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D" +
            "B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226" +
            "1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C" +
            "BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC" +
            "E0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF";
        const g4096 = 5;
        const N4096 = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08" +
            "8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B" +
            "302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9" +
            "A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6" +
            "49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8" +
            "FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D" +
            "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C" +
            "180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718" +
            "3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D" +
            "04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D" +
            "B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226" +
            "1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C" +
            "BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC" +
            "E0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B26" +
            "99C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB" +
            "04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2" +
            "233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127" +
            "D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934063199" +
            "FFFFFFFFFFFFFFFF";
        const g6144 = 5;
        const N6144 = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08" +
            "8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B" +
            "302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9" +
            "A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6" +
            "49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8" +
            "FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D" +
            "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C" +
            "180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718" +
            "3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D" +
            "04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D" +
            "B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226" +
            "1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C" +
            "BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC" +
            "E0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B26" +
            "99C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB" +
            "04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2" +
            "233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127" +
            "D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934028492" +
            "36C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406" +
            "AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918" +
            "DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B33205151" +
            "2BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03" +
            "F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97F" +
            "BEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AA" +
            "CC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58B" +
            "B7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632" +
            "387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E" +
            "6DCC4024FFFFFFFFFFFFFFFF";
        const g8192 = 19;
        const N8192 = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08" +
            "8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B" +
            "302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9" +
            "A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6" +
            "49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8" +
            "FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D" +
            "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C" +
            "180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718" +
            "3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D" +
            "04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D" +
            "B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226" +
            "1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C" +
            "BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC" +
            "E0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B26" +
            "99C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB" +
            "04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2" +
            "233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127" +
            "D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934028492" +
            "36C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406" +
            "AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918" +
            "DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B33205151" +
            "2BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03" +
            "F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97F" +
            "BEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AA" +
            "CC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58B" +
            "B7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632" +
            "387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E" +
            "6DBE115974A3926F12FEE5E438777CB6A932DF8CD8BEC4D073B931BA" +
            "3BC832B68D9DD300741FA7BF8AFC47ED2576F6936BA424663AAB639C" +
            "5AE4F5683423B4742BF1C978238F16CBE39D652DE3FDB8BEFC848AD9" +
            "22222E04A4037C0713EB57A81A23F0C73473FC646CEA306B4BCBC886" +
            "2F8385DDFA9D4B7FA2C087E879683303ED5BDD3A062B3CF5B3A278A6" +
            "6D2A13F83F44F82DDF310EE074AB6A364597E899A0255DC164F31CC5" +
            "0846851DF9AB48195DED7EA1B1D510BD7EE74D73FAF36BC31ECFA268" +
            "359046F4EB879F924009438B481C6CD7889A002ED5EE382BC9190DA6" +
            "FC026E479558E4475677E9AA9E3050E2765694DFC81F56E880B96E71" +
            "60C980DD98EDD3DFFFFFFFFFFFFFFFFF";
        Groups.groups.set(1024, { N: new BinaryNumber(N1024), Nraw: N1024, g: new BinaryNumber(g1024), size: 1024, hash: "sha1" });
        Groups.groups.set(1536, { N: new BinaryNumber(N1536), Nraw: N1536, g: new BinaryNumber(g1536), size: 1536, hash: "sha1" });
        Groups.groups.set(2048, { N: new BinaryNumber(N2048), Nraw: N2048, g: new BinaryNumber(g2048), size: 2048, hash: "sha256" });
        Groups.groups.set(3072, { N: new BinaryNumber(N3072), Nraw: N3072, g: new BinaryNumber(g3072), size: 3072, hash: "sha256" });
        Groups.groups.set(4096, { N: new BinaryNumber(N4096), Nraw: N4096, g: new BinaryNumber(g4096), size: 4096, hash: "sha256" });
        Groups.groups.set(6144, { N: new BinaryNumber(N6144), Nraw: N6144, g: new BinaryNumber(g6144), size: 6144, hash: "sha256" });
        Groups.groups.set(8192, { N: new BinaryNumber(N8192), Nraw: N8192, g: new BinaryNumber(g8192), size: 8192, hash: "sha256" });
    }
    static get(keySize) {
        Groups.initialize();
        if (Groups.groups.has(keySize))
            return Groups.groups.get(keySize);
        else
            throw new Error(`Invalid SRP key size "${keySize}". Must be either: 1024 | 1536 | 2048 | 3072 | 4096 | 6144 | 8192`);
    }
    static customSRPGroup(size, hash) {
        const group = Groups.get(size);
        if (group == null)
            throw new Error(`Invalid SRP key size "${size}". Must be either: 1024 | 1536 | 2048 | 3072 | 4096 | 6144 | 8192`);
        else if (hash == null || (hash !== "sha1" && hash !== "sha256"))
            throw new Error(`Invalid hash algorithm "${hash}". Must be either: "sha1" | "sha256"`);
        return {
            size: group.size,
            Nraw: group.Nraw,
            N: group.N,
            g: group.g,
            hash: hash
        };
    }
}
Groups.hasInitialized = false;
Groups.groups = new Map();
function random(size) {
    let r = null;
    if (isNode) {
        const crypto = require("crypto");
        r = crypto.randomBytes(size).toString("hex");
    }
    else if (typeof window != "undefined") {
        const intArray = new Uint8Array(size);
        window.crypto.getRandomValues(intArray);
        r = Array.prototype.map.call(intArray, x => ('00' + x.toString(16)).slice(-2)).join('');
    }
    return new BinaryNumber(r);
}
function CONCAT(a1, a2) {
    const n1 = typeof a1 === "string" ? a1 : a1.hex();
    const n2 = typeof a2 === "string" ? a2 : a2.hex();
    return n1 + n2;
}
exports.CONCAT = CONCAT;
function PAD(data, length) {
    const buffer = typeof data === "number" ? buffer_1.Buffer.from([data]) : buffer_1.Buffer.from(data.hex(), "hex");
    const size = buffer.byteLength;
    const padding = length - buffer.length;
    if (padding < 0)
        throw new Error(`Negative padding supplied to SRP.PAD. LEN:${length}, Buffer:${buffer.length}, PAD: ${padding}`);
    if (typeof data == "number") {
        const result = buffer_1.Buffer.alloc(length);
        result.fill(0, 0, padding);
        buffer.copy(result, padding);
        if (result.length !== length || result.byteLength !== length)
            throw new Error(`Unable to pad buffer from ${size} to ${length}`);
        return result.toString("hex");
    }
    else {
        let pad = "";
        for (let i = 0; i < padding; i++) {
            pad += "0";
        }
        return `${pad}${data}`;
    }
}
exports.PAD = PAD;
function BITS(data) {
    return new sjcl_1.default.bn(data).toBits();
}
exports.BITS = BITS;
function HASH(num, hashFn) {
    const fn = hashFn === "sha1" ? sjcl_1.default.hash.sha1 : sjcl_1.default.hash.sha256;
    let data;
    if (typeof num === "string")
        data = num;
    else if (BinaryNumber.isBinaryNumber(num))
        data = num.toArray();
    else
        data = num;
    const hashBits = fn.hash(data);
    const hash = sjcl_1.default.codec.hex.fromBits(hashBits);
    return new BinaryNumber(hash);
}
exports.HASH = HASH;
function makeX(I, P, s, Ng) {
    //    x = SHA1(s | SHA1(I | ":" | P))
    const x = HASH(s.concat(HASH(I + ":" + P, Ng.hash)), Ng.hash);
    if (x.compareTo(Ng.N) < 0)
        return x;
    else
        return x.mod(Ng.N.minus(1));
}
function makeVerifier(I, P, s, Ng) {
    //    x = SHA1(s | SHA1(I | ":" | P))
    const x = makeX(I, P, s, Ng);
    //    v = g^x % N
    const v = Ng.g.powerModulus(x, Ng.N);
    return v;
}
function makeB(Ng, s, v, b) {
    //    k = SHA1(N | PAD(g))
    const k = makeK(Ng);
    //    B = k*v + g^b % N
    const B = k.times(v).plus(Ng.g.powerModulus(b, Ng.N)).mod(Ng.N);
    return B;
}
function makeK(Ng) {
    //    k = SHA1(N | PAD(g))
    const k = HASH(BITS(CONCAT(Ng.N, PAD(Ng.g.toNumber(), Ng.size / 8))), Ng.hash);
    return k;
}
function makeA(Ng, a) {
    //    A = g^a % N
    const A = Ng.g.powerModulus(a, Ng.N);
    return A;
}
function makeU(A, B, Ng) {
    //    u = SHA1(PAD(A) | PAD(B))
    const u = HASH(BITS(PAD(A, Ng.size / 8)).concat(BITS(PAD(B, Ng.size / 8))), Ng.hash);
    return u;
}
function makeServerPreMasterSecret(A, v, s, Ng, b) {
    //    B = k*v + g^b % N
    const B = makeB(Ng, s, v, b);
    //    u = SHA1(PAD(A) | PAD(B))
    const u = makeU(A, B, Ng);
    //    <premaster secret> = (A * v^u) ^ b % N
    const pms = (A.times(v.powerModulus(u, Ng.N))).mod(Ng.N).powerModulus(b, Ng.N);
    return {
        AB: B,
        ab: b,
        S: pms
    };
}
function makeClientPreMasterSecret(I, P, Ng, s, B, a) {
    //    A = g^a % N
    const A = makeA(Ng, a);
    //    u = SHA1(PAD(A) | PAD(B))
    const u = makeU(A, B, Ng);
    //    k = SHA1(N | PAD(g))
    const k = makeK(Ng);
    //    x = SHA1(s | SHA1(I | ":" | P))
    const x = makeX(I, P, s, Ng);
    //    <premaster secret> = (B - (k * g^x)) ^ (a + (u * x)) % N
    const S = B.plus(Ng.N.times(k)).minus(Ng.g.powerModulus(x, Ng.N).times(k)).mod(Ng.N).powerModulus(x.times(u).plus(a), Ng.N);
    return {
        AB: A,
        ab: a,
        S: S
    };
}
function encrypt(key, data) {
    const k = (typeof key === "string") ? key : key.hex();
    const iv = sjcl_1.default.random.randomWords(4, 0);
    const salt = random(32).hex();
    const params = {
        salt: salt,
        iv: sjcl_1.default.codec.base64.fromBits(iv),
        cipher: "aes",
        ks: 256
    };
    const encrypted = sjcl_1.default.encrypt(k, data, params);
    return encrypted;
}
function decrypt(key, cipherEncrypted) {
    const k = (typeof key === "string") ? key : key.hex();
    return sjcl_1.default.decrypt(k, cipherEncrypted);
}
exports.default = {
    makeVerifier,
    makeServerPreMasterSecret,
    makeClientPreMasterSecret,
    Groups,
    makeB,
    makeA,
    random,
    makeX,
    makeK,
    makeU,
    encrypt,
    decrypt
};
