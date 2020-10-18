/*
 * Copyright (C) 2019-2020 Tyler Swann - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Tyler Swann <tyler.swann94@gmail.com>
 * on 09/01/2020 at 6:24 PM
 */
const chalk = require("chalk");
const BigNumber = require("bignumber.js").BigNumber;
const SRP = require("../dist/SRP").default;
const BinaryNumber = require("../dist/SRP").BinaryNumber;

BigNumber.DEBUG = true;
const SRP_TEST_CASES = [
    {
        "name": "1024 bit key",
        "I": "alice",
        "P": "password123",
        "s": "BEB25379D1A8581EB5A727673A2441EE",
        "a": "60975527035CF2AD1989806F0407210BC81EDC04E2762A56AFD529DDDA2D4393",
        "b": "E487CB59D31AC550471E81F00F6928E01DDA08E974A004F49E61F5D105284D20",
        "A": "61D5E490F6F1B79547B0704C436F523DD0E560F0C64115BB72557EC44352E8903211C04692272D8B2D1A5358A2CF1B6E0BFCF99F921530EC8E39356179EAE45E42BA92AEACED825171E1E8B9AF6D9C03E1327F44BE087EF06530E69F66615261EEF54073CA11CF5858F0EDFDFE15EFEAB349EF5D76988A3672FAC47B0769447B",
        "B": "BD0C61512C692C0CB6D041FA01BB152D4916A1E77AF46AE105393011BAF38964DC46A0670DD125B95A981652236F99D9B681CBF87837EC996C6DA04453728610D0C6DDB58B318885D7D82C7F8DEB75CE7BD4FBAA37089E6F9C6059F388838E7A00030B331EB76840910440B1B27AAEAEEB4012B7D7665238A8E3FB004B117B58",
        "v": "7E273DE8696FFC4F4E337D05B4B375BEB0DDE1569E8FA00A9886D8129BADA1F1822223CA1A605B530E379BA4729FDC59F105B4787E5186F5C671085A1447B52A48CF1970B4FB6F8400BBF4CEBFBB168152E08AB5EA53D15C1AFF87B2B9DA6E04E058AD51CC72BFC9033B564E26480D78E955A5E29E7AB245DB2BE315E2099AFB",
        "x": "94B7555AABE9127CC58CCF4993DB6CF84D16C124",
        "u": "CE38B9593487DA98554ED47D70A7AE5F462EF019",
        "k": "7556AA045AEF2CDD07ABAF0F665C3E818913186F",
        "spms": "B0DC82BABCF30674AE450C0287745E7990A3381F63B387AAF271A10D233861E359B48220F7C4693C9AE12B0A6F67809F0876E2D013800D6C41BB59B6D5979B5C00A172B4A2A5903A0BDCAF8A709585EB2AFAFA8F3499B200210DCC1F10EB33943CD67FC88A2F39A4BE5BEC4EC0A3212DC346D7E474B29EDE8A469FFECA686E5A",
        "cpms": "B0DC82BABCF30674AE450C0287745E7990A3381F63B387AAF271A10D233861E359B48220F7C4693C9AE12B0A6F67809F0876E2D013800D6C41BB59B6D5979B5C00A172B4A2A5903A0BDCAF8A709585EB2AFAFA8F3499B200210DCC1F10EB33943CD67FC88A2F39A4BE5BEC4EC0A3212DC346D7E474B29EDE8A469FFECA686E5A",
        "Ng": SRP.Groups.customSRPGroup(1024, "sha1")
    },
    {
        "name": "1536 bit key",
        "I": "tyler",
        "P": "mypassword123",
        "s": "4d0f1408b81ce5c93f7d824bdbf410f52c4cbb3c8d291289651fd042ce11ab6eb8f2c84083c85531",
        "a": "654aa95fdd0d5392a0d3c137558852721ceec13df07bd0abdacd7dc487998625",
        "b": "f109d127a34e017f28b81d327c5bf9dfea771169644210ebd0ab49b7844fda85",
        "A": "8c61e3ce170232bf267e8bea7589cf69ffd5faae76390f7c5a55499d55c96cc2e0354eca1d90e53359a3c5f260c5b402c26043615f20800bfc3e6eaf51665cc1f6b5f74ea6b35d50549d7c4e0816732ccc25335d08cb6e6faa56506c6daf637f6a0e596ae94b88f5ee70e621bb9560dc03d277251ddd9cc2bd8e89157c646f957d7483a41100edf93c8570e9af3d9d4034cab7e686eee83ec387d2601af8f49928b29ce9b3054851b9e89b8000fee6279cbc262c45098a49caad58dc7b424994",
        "B": "289487dc27ee3fbcb1671dd1c0ead4c592433a06589ceda1cda30070ef8b4f7d45f6f0413da2265c4629d0ee4eb2791f363befee2b237d2660850749a49ba81fd9bc630c1ca74a4b8b832833136e1f538d7ea7a436e96c0a841d21656ff4101caa08cc93c7d9fdb2b3210c873ca0a377550978fe85ab26d3d8f8babd2e8a87a145b9db64254fa3035100d08db2fcca85a69dc122dd5aba74170f8151e3e55967f0d8988f0e332a4399038e23ee4d530bbbaa776aff361f2b71b4640f552d056b",
        "v": "611487ee795037bd99cf3fa85e75bf2126d16222ed146ed60884cff663280584d7ab2a5f207f681c7dda420bb3bdbbdaee33b7ba38f31a32d076098c40d34ff04d626a4650ab649cb48bfe0b88430b3ac02bd5606f998e12aec2200835ed3f572166338164be2315aaf4c9b36cf5cf6200fe1c96411f7a3ae636cdbe0a0839e683f71db8d00894568f373649fd040f07680b8083d8987eed884b43126ccd78a3c592be15ab17e0714ca5f096f5c7f33165f3df354ded9e88ca7dae6a59e11e64",
        "x": "b99940c1fe691dba2f81d24a591de8e687efa993",
        "u": "1f52282b91129d069743feedad5091b171ac91cb",
        "k": "815a4561e1a68b3fb7f6c03bbb3daaa35d528d90",
        "spms": "9dec26db3ccd93b17c3dabd1d31b34341578030c61bdb2581f2c7a0bb0b7127b1784a8fbc543c920ef25c7519c967f9734131c29e1100db3e6025d2a7e9edd5930b2ce1c3e84a039926bcd40c97c74848492498294229b25265f754245ca1e43129c96714798a928fe5b0d2d0e3e39a39e2a419e930f4427e4e64394edba5e0b1c1c49bce6ea40339ef51f61626b94547fa89a63a9828bd36882689a866a0d3f4e59c09fded61aa86433648f81649f1ac3046054f8b4f1106d142576dcd05849",
        "cpms": "9dec26db3ccd93b17c3dabd1d31b34341578030c61bdb2581f2c7a0bb0b7127b1784a8fbc543c920ef25c7519c967f9734131c29e1100db3e6025d2a7e9edd5930b2ce1c3e84a039926bcd40c97c74848492498294229b25265f754245ca1e43129c96714798a928fe5b0d2d0e3e39a39e2a419e930f4427e4e64394edba5e0b1c1c49bce6ea40339ef51f61626b94547fa89a63a9828bd36882689a866a0d3f4e59c09fded61aa86433648f81649f1ac3046054f8b4f1106d142576dcd05849",
        "Ng": SRP.Groups.customSRPGroup(1536, "sha1")
    },
    {
        "name": "2048 bit key",
        "I": "tyler",
        "P": "password123",
        "s": "4d0f1408b81ce5c93f7d824bdbf410f52c4cbb3c8d291289651fd042ce11ab6eb8f2c84083c85531",
        "a": "654aa95fdd0d5392a0d3c137558852721ceec13df07bd0abdacd7dc487998625",
        "b": "f109d127a34e017f28b81d327c5bf9dfea771169644210ebd0ab49b7844fda85",
        "A": "4ad7c8966cde50bda97e9332c4db7f4dcae212b5f81f8def9031dcbc73bb86cd7fc6ff24a78675f1a13281d2659c52624e9d1d313bd47fb1af5d8e7d17424bb3fe6c03fcabed850f96dfda4421143bb868a864b102897f58b6679892b561ce25a201466948ccf574c5b90b8a42be212a810e4df5b251eebb07b052156cd8c2010a36914e238189dc957a33c60e345e5c96810a93f8ccce820a2c4eecb3d7daddb36381474fe36e6f363c081161f1d93f265a679e7313d0fd213c7bbd7449b5a4866ae6891886505c3cf8555477a0614d33e0011fbd306bf02ab02e8cd45c85f2fb6d1e7777eb300649a38913dbb827b0528b33cc73e90671ed845a6fe627299c",
        "B": "a487fdf78a4657fb760c3c598a439d70fa17909d8f529056a7592e24c6263c7684f0c0cbe6e4e20604aad90d373bd447d50cd0358277418cad00c5ee7b2d2db7c16f66e2727e8ee37b1617a865a058a298755dcc4df42d1a71e263edc1194969a55ec86454e16958dbd1dd33cb8dd689559bf0cfd156bb2e1a9c5f591cf9190983bacbc1eb5aad31d3701c76cf15f9e5cc05d2a68ffe4a7d2f5f2d5415dae35489d976c3e06eeca34fa0943d95061b0bd2d735e725fdecb097d95bb55241846771a8ae64c9fe74bdc1869087d0fdc1450eddf1947d299f08186e9f62177b899a1d94004a1de117cda50ba50a8c276b8726168beecf68961a1c04ca525b7277db",
        "v": "90e45c58ef74b7b26395d2f5182c1e24204d8a9f4fb0be1e6f615e865412b3365b5067762b65693eac1d9a1056b87d13ddd7dff96bf834e408881225635750ca8df11bfad600854bee916c9b73ab5dc48e570dfb74aec8b38a4e2a2241eb2f92af1a005264206399779091e448442b7eff75ce49b4eeb7f90200d4b10569947ae5f76982b2c16193fea65e500c8ea84f495581259f0f0ccd4a35e773eeeb86e5616f4ceece80ae12e81237ebf3f24347d7fb51652406742a4b684a04f1411fa0222a3d270a74c90b504fd1660425e22c53285392e0261bde61ec310842bb6844df6491fe60274017b0f8f2518ae48cb4a60dd0febe4c696f8be62d30dcec6a02",
        "x": "6401444a6b729475d05bdd6f48a2389eec5559ea",
        "u": "7bb19e8d96eb709a503cb8de294cd88bec110fc3",
        "k": "a56303f32c60e599e82c396f0d57f1b344a7313c",
        "spms": "3a9df7dd78717754402283f5eefc00ccc928b60440215f00219bc1c465c8a83d4a0641f544ae08e084808010d2467141b0f6556ac4954307fda598f4d6511e5ed236a25509c6fe4bdeee0698020d56fa87d8764fe1a229eae592ee8156865f7ad640387621988c5b2aab73024b94369ac8bd41340b2f8557d05df3911329d8e66a3168ed345b6be36a5830395cc97a608d2a04e5d2e12864892c2c58b4de47d45e2113dd812d05a4f3c60e6669bbc0b7875da0b36c7fd9265e7e5711142870ce466530c38aab10e947bbf3d39ab70009b24f18b16440d05b80888e62834867b6ea84fc20c92ffe44d1bcf19f3b1165eeb6a718d57cb5a9f5db891c7ffa58b574",
        "cpms": "3a9df7dd78717754402283f5eefc00ccc928b60440215f00219bc1c465c8a83d4a0641f544ae08e084808010d2467141b0f6556ac4954307fda598f4d6511e5ed236a25509c6fe4bdeee0698020d56fa87d8764fe1a229eae592ee8156865f7ad640387621988c5b2aab73024b94369ac8bd41340b2f8557d05df3911329d8e66a3168ed345b6be36a5830395cc97a608d2a04e5d2e12864892c2c58b4de47d45e2113dd812d05a4f3c60e6669bbc0b7875da0b36c7fd9265e7e5711142870ce466530c38aab10e947bbf3d39ab70009b24f18b16440d05b80888e62834867b6ea84fc20c92ffe44d1bcf19f3b1165eeb6a718d57cb5a9f5db891c7ffa58b574",
        "Ng": SRP.Groups.customSRPGroup(2048, "sha1")
    },
    {
        "name": "2048 bit #2 ",
        "I": "tyler",
        "P": "pass",
        "s": "4d0f1408b81ce5c93f7d824bdbf410f52c4cbb3c8d291289651fd042ce11ab6eb8f2c84083c85531",
        "a": "654aa95fdd0d5392a0d3c137558852721ceec13df07bd0abdacd7dc487998625",
        "b": "f109d127a34e017f28b81d327c5bf9dfea771169644210ebd0ab49b7844fda85",
        "A": "4ad7c8966cde50bda97e9332c4db7f4dcae212b5f81f8def9031dcbc73bb86cd7fc6ff24a78675f1a13281d2659c52624e9d1d313bd47fb1af5d8e7d17424bb3fe6c03fcabed850f96dfda4421143bb868a864b102897f58b6679892b561ce25a201466948ccf574c5b90b8a42be212a810e4df5b251eebb07b052156cd8c2010a36914e238189dc957a33c60e345e5c96810a93f8ccce820a2c4eecb3d7daddb36381474fe36e6f363c081161f1d93f265a679e7313d0fd213c7bbd7449b5a4866ae6891886505c3cf8555477a0614d33e0011fbd306bf02ab02e8cd45c85f2fb6d1e7777eb300649a38913dbb827b0528b33cc73e90671ed845a6fe627299c",
        "B": "691bd60bbd57fdedea4be0057a7ff71c88647bee4cc9c53e981d8f6b400ae53f924d767f2d2803b525771199b2944573cd7d78152c8db1f089f1a75336e5e4ae35aaba2155d046212c762b7e939a9302cb47065f16d4adb468ab34b88cc642c67d176dde9f0e1bf21821ab973d897fe80b585f8848c7c1d5eefc4d516095bb5ddbb683b2f3d2f7b74b25e9aa156e0fc436c42a97418338b35c88f7f283982c5c6d60151d74a8a77ae8021a8ec7904e86486c47785515dfc7253ab99c11c1d54df7b1c2809070bad50f5a663b97d42bc38c3004e89e9a6cf91d06e271ac0250f56b72849366aa65852d34c72cd61136382601ebd962db7bfbb78c54c9f5675fd",
        "v": "4bb81f985516386ab58475c206dc3e707d64538b96735ff5c6d206b37e7cf7549052d3834b3fb51b9c9502deda4bf2c7626e3607de51ec306aaa1e0d21534812d21905ab579058a18bdaf9e9b8988ac349d1d1b69372c44a31b77cc31402aa08e58b0e11dfe6366db2473a25444080581f7da12dd67e94a1e6bce9427017da0c5b2b0104f30d51c0164b9409a8ac904b2cef64d3dc24a15b5867175c7765021a733db893e2e6a89f7a8173ef4644ad392e6ac7efd658a93425533ab7a1df0f7bca5888d1d55e8783f330ee9109566a7e9a9a887a70597ede773e57735f2ce87209ce96c66c0dc8f81bbea4cfa71fa3936bd4107f6a967425b91ca3b01708b13",
        "x": "370fed0b8e92ca00841134022856eb98132ff09a",
        "u": "849429315a4ad4dd31b1d765b747281b57bb37ac",
        "k": "a56303f32c60e599e82c396f0d57f1b344a7313c",
        "spms": "2abdf995b14cf03a1e938bc0f9908b7e0494ac4288120fdfa391b9c4b26709b3497c83a9518e7a37cef870c3b24d7ac8d557dae19dd01e23352b5513dab13a93eb83fc210f70e7649d0e9b09287ee324c189ab1588be19a17fb735e0815bf5c6eb720d1d9409a49110a43130ffabf1a69177b5012ea5358ee5841b75bacfe794b7e21bf700e0c2c88553429955bbcbc5d259b8f043807af05d67d730714d2985c41b8bf028a5fc34e1be756e0ffd9c32c9ffd59b96fce2e28c2e6d12e5fd5d46b34229582f549f0216dd1dfab05dcda4d7d9268d41ba80cbff816cac6bb99874d3a78c742bb6e172edd20b3612dc300347830b3fcb7ca8a82c585b46e363ea8d",
        "cpms": "2abdf995b14cf03a1e938bc0f9908b7e0494ac4288120fdfa391b9c4b26709b3497c83a9518e7a37cef870c3b24d7ac8d557dae19dd01e23352b5513dab13a93eb83fc210f70e7649d0e9b09287ee324c189ab1588be19a17fb735e0815bf5c6eb720d1d9409a49110a43130ffabf1a69177b5012ea5358ee5841b75bacfe794b7e21bf700e0c2c88553429955bbcbc5d259b8f043807af05d67d730714d2985c41b8bf028a5fc34e1be756e0ffd9c32c9ffd59b96fce2e28c2e6d12e5fd5d46b34229582f549f0216dd1dfab05dcda4d7d9268d41ba80cbff816cac6bb99874d3a78c742bb6e172edd20b3612dc300347830b3fcb7ca8a82c585b46e363ea8d",
        "Ng": SRP.Groups.customSRPGroup(2048, "sha1")
    },
    {
        "name": "3072 bit key",
        "I": "tyler",
        "P": "mypassword123",
        "s": "4d0f1408b81ce5c93f7d824bdbf410f52c4cbb3c8d291289651fd042ce11ab6eb8f2c84083c85531",
        "a": "654aa95fdd0d5392a0d3c137558852721ceec13df07bd0abdacd7dc487998625",
        "b": "f109d127a34e017f28b81d327c5bf9dfea771169644210ebd0ab49b7844fda85",
        "A": "94ddb5bd2d3c3c21f1241443913c22716649cdd8980d2142565ab5b9c0085488066e51ad64bb3c210fecdbb4a4a68ddb6f128209de853f86052ebd8c222b65deed47615de352698ec90cb9fa1f9c070a0f111ad7bd480b3b058203410a965ea01045240d8459bd107816b0d525ab10cfd0bebc145c68e85a2577b8c63a884d7b9cc78048c0b6d70fea0dd1150c83321724942b8e7ec71e4ec30618491d814fe2e7c1f4503d9f88349532d06c59ebbcf6b21f1c50decfd5c314eecd6ae9242f7db0a31dbb7fc6516a2d936daa88a3c4237ceb4d018c97d5696343d6b70cc6941d91bf03829dfd80c5e866b9f3125ca403eadf8ed68017b6ba7b77662c715a10b36a3a3f630d836a3f7398cd13eb2b9099fb0559f5d6654504b3d7a9e804a06e3f184b417728ef540ae2ef9fcc38b71dd21362b3c8ac0252b3355276e48566c88044ef860c760597bd796bdf695cbd49fd9f66961fde422ffeddf9ff448dfbdadb1432740522515fbfe63511e95bb8abdb2786023edaa59aef44eac175cdc95dde",
        "B": "e6146769caca096d7ce423927b7a0b40266169e9a7cc323926def49e8084881018199fff9ab87b0764f280f269f048faa034cb5d7f887279b28822d12304a121957b5f6b99155bd8074333f29b6bed8e86b990188b937d3eec2e0fdf3f58af51f65b735ba6674dc7219cfba3dea8beaec01324b8d8844dd818740380d4ee0ef38d1b224aaea49ee6c1e66f057aad35910aba7948f720ef83e67626a99f8752f9b2b4b538fc494a08ba09025ac271f3b42360c8c75ca0bddc72fdb26098a808ed11f8b95e7acd0030367a02dac4abf94f21663babb529e43a58e4e112dc9e20ba802ab29328837750809073e5dc54432735dedc174ca6b804a888ce8dfc482d6334e7042fe1730e01f843bab9190ecd85d3354b0ad15735f59506ac1a4da8f6c7a67249f31cd02b595b6922d6ac93dacf8e1fba0781688e682873d04ef5d77cc20816506d2599f4ed05d6f904d248841ecd8e18a8e88d283fba8936939a6f5657dd0646416d03a722c3e846aead29d7fce23e666823efc24ab976860fc88229f7",
        "v": "90c08df557504315c54afdcc74ef7ab5272010ef770154c853e144d5443f285a9f38804f03f4c539dd9b601f6cd31a24f2ddfcea5253587c8ecfe8d0e0fba67e784728a10ffda1ee892346b5b313bdeb1881527fc2aade72873f0483ebc213254d5800d041ca2a6cc31a9bc4e184fc7a00da7662600185741e55c9144ad7ec9e4fe181f9139dfa7bfbda091151dbabba837d6e0f91cd4c09bc5f3fcb23c9e7d0a9e3fd0cbf4ea1156de36fc506a53aa24f1df023c9aa857509e9e6a8299d2c272b304b4b762a2a6f6ec7cb640d8fb687771e091f71e0bce2decb65f2775b46e5a86651729a52cc26191b604391a07ad769badb98696e777eb24367bf9669131e81ed86fd8ec7624a28c3e85ee77383fa4736d86750642bd4cca20e0685ea00048a50adbdd06d747c12dafa269af8bb27d0510aa49d7d091ff4cbb95431343271c4309c648cb28bd4ad8da01181537698bdaded3b6d7ae77fcb057f57b0b9ead18b9cd7c0a94f4b8d338b006c77f744c2fd86b4a9bfbcb4487a538efc3a573ad3",
        "x": "b99940c1fe691dba2f81d24a591de8e687efa993",
        "u": "f0ca6fc39aec0a65fa9a3949d882282c388f1eaa",
        "k": "c2fd8f8b274fa634efd702bd22fb6c1218d9f2a0",
        "spms": "4830a1b3ff7657600c2cdd2a4c4cc8e7d150708ad44ed4d0304bea07a9bf40bb89a9dca19d5a3bfebf349110b878d2dbc5f69b0424a14068bd0a910c55fbae6cbb463bfb159af51ea240998f4748d32f2fee7a9caa0ef33caa13950eccff5985ca5fa03e39bc52206bb49bf731b499cdf8792d154f176f375e2b0661e13e77e5ae748c8ccb14c04c34bf715dea1ebc582c1eac5e713ae096f86f4c3e817fbb2b7714d82156b2bcea0da991e98622b5d764d09aff887d8b161a61b0f93b779d87b49435a58a3032e664021e89ee144a5b3a5673f757a1dd3a3cfd7237249a45a8156ced945686412411f40b1726bf1a6ebb0bf364b0f8749466b5777c437be3657eb4c21abf8db999acdc2e23d17b7dc766302741992cd2cc75a2aba79c22d9a336f413a186e5b94be8fc4f53cde1ed79a6e92a1512d12b4891c7d5cb2c74629938be049e821e6e8a64963dca22fa673648d70c7ff941c143c07c9703a1f62ad72db8348c3ac5ddaba63e52e21c88b8bc89f930090f221332e9b432a2c58c8f32",
        "cpms": "4830a1b3ff7657600c2cdd2a4c4cc8e7d150708ad44ed4d0304bea07a9bf40bb89a9dca19d5a3bfebf349110b878d2dbc5f69b0424a14068bd0a910c55fbae6cbb463bfb159af51ea240998f4748d32f2fee7a9caa0ef33caa13950eccff5985ca5fa03e39bc52206bb49bf731b499cdf8792d154f176f375e2b0661e13e77e5ae748c8ccb14c04c34bf715dea1ebc582c1eac5e713ae096f86f4c3e817fbb2b7714d82156b2bcea0da991e98622b5d764d09aff887d8b161a61b0f93b779d87b49435a58a3032e664021e89ee144a5b3a5673f757a1dd3a3cfd7237249a45a8156ced945686412411f40b1726bf1a6ebb0bf364b0f8749466b5777c437be3657eb4c21abf8db999acdc2e23d17b7dc766302741992cd2cc75a2aba79c22d9a336f413a186e5b94be8fc4f53cde1ed79a6e92a1512d12b4891c7d5cb2c74629938be049e821e6e8a64963dca22fa673648d70c7ff941c143c07c9703a1f62ad72db8348c3ac5ddaba63e52e21c88b8bc89f930090f221332e9b432a2c58c8f32",
        "Ng": SRP.Groups.customSRPGroup(3072, "sha1")
    }
];

function runSRPTestCases()
{
    for (let i = 0; i < SRP_TEST_CASES.length; i++)
    {
        const testCase = SRP_TEST_CASES[i];
        const I = testCase.I;
        const P = testCase.P;
        const s = new BinaryNumber(testCase.s);
        const a = new BinaryNumber(testCase.a);
        const b = new BinaryNumber(testCase.b);
        const Ng = testCase.Ng;
        const expectedA = new BinaryNumber(testCase.A);
        const expectedB = new BinaryNumber(testCase.B);
        const expectedV = new BinaryNumber(testCase.v);
        const expectedX = new BinaryNumber(testCase.x);
        const expectedK = new BinaryNumber(testCase.k);
        const expectedU = new BinaryNumber(testCase.u);
        const expectedSPMS = new BinaryNumber(testCase.spms);
        const expectedCPMS = new BinaryNumber(testCase.cpms);
        const x = SRP.makeX(I, P, s, Ng);
        const v = SRP.makeVerifier(I, P, s, Ng);
        const A = SRP.makeA(Ng, a);
        const B = SRP.makeB(Ng, s, v, b);
        const k = SRP.makeK(Ng);
        const u = SRP.makeU(A, B, Ng);
        const spms = SRP.makeServerPreMasterSecret(A, v, s, Ng, b);
        const cpms = SRP.makeClientPreMasterSecret(I, P, Ng, s, B, a);
        console.log(`${chalk.greenBright.bold("\n+---------------------------------------------------------------------------+")}`);
        console.log(`${chalk.greenBright.bold(  `|                                ${testCase.name}                               |`)}`);
        console.log(`${chalk.greenBright.bold(  "+---------------------------------------------------------------------------+")}`);
        assertEquals(x.toString(16), expectedX.toString(16), "makeX      ");
        assertEquals(v.toString(16), expectedV.toString(16), "makeV      ");
        assertEquals(A.toString(16), expectedA.toString(16), "makeA      ");
        assertEquals(B.toString(16), expectedB.toString(16), "makeB      ");
        assertEquals(k.toString(16), expectedK.toString(16), "makeK      ");
        assertEquals(u.toString(16), expectedU.toString(16), "makeU      ");
        assertEquals(spms.S.toString(16), expectedSPMS.toString(16), "makeServerS");
        assertEquals(cpms.S.toString(16), expectedCPMS.toString(16), "makeClientS");
        console.log(`${chalk.greenBright.bold(  "-----------------------------------------------------------------------------")}`);
    }
}

function assertEquals(x, ex, testName)
{
    const expectTrunk = ex == null ? "null" : ex.length > 10 ? `${ex.slice(0, 10)} (${ex.length}b)` : ex;
    const gotTrunk = x == null ? "null" : x.length > 10 ? `${x.slice(0, 10)} (${x.length}b)` : x;
    if (x === ex)
    {
        const pass = `${chalk.bgGreenBright.whiteBright.bold("  PASS  ")} ${testName}: `;
        console.log(`${pass} Exp: ${expectTrunk}..., Got: ${gotTrunk}...`);
    }
    else
    {
        const failed = `${chalk.bgRedBright.whiteBright.bold("  FAIL  ")} ${testName}: `;
        console.log(`${failed} Exp: ${expectTrunk}..., Got: ${gotTrunk}...`);
    }
}


runSRPTestCases();