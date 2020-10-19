/*
 * Copyright (C) 2019-2020 Tyler Swann - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Tyler Swann <tyler.swann94@gmail.com>
 * on 09/05/2020 at 9:14 AM
 */



const React = require( "react");
const express = require("express");
const server = new express();
const SRPSession = require("secure-remote-password").default;

/**
 *
 * @type {Map<string, SRPClientModel>}
 */
const users = new Map();


server.get("/", (req, res) => {
    res.status(200).send("HELLO!");
});

server.post("/api/register", express.json(), (req, res) => {
    /**
     * @type {SRPClientModel}
     */
    const form = req.body;
    if (form == null)
        res.status(400).send("SRPClientModel must be provided in body of request");
    else if (form.username == null || /^\s*$/.test(form.username))
        res.status(400).send("Invalid username!");
    else if (form.salt == null || /^\s*$/.test(form.salt))
        res.status(400).send("Parameter 'salt' is required!");
    else if (form.verifier == null || /^\s*$/.test(form.verifier))
        res.status(400).send("Parameter 'verifier' is required!");
    else if (form.policy == null)
        res.status(400).send("Parameter 'policy' is required!");
    else if (form.policy.size == null)
        res.status(400).send("Parameter 'policy.size' is required!");
    else if (form.policy.hash == null)
        res.status(400).send("Parameter 'policy.hash' is required!");
    else if (users.has(form.username))
        res.status(400).send(`User "${form.username}" already exists!`);
    else
    {
        users.set(form.username, form);
        res.status(200).send("REGISTERED!");
    }
});

server.get("/api/auth-params/:username", (req, res) => {
    const username = req.params.username;
    if (username == null || /^\s*$/.test(username))
        res.status(400).send(`URL parameter "username" is required`);
    else if (!users.has(username))
        res.status(404).send(`User "${username}" not found!`);
    else
    {
        const model = users.get(username);
        SRPSession.destroySession(username);
        SRPSession.newServerSession(model)
            .then(serverSession => {
                res.status(200).send(JSON.stringify(serverSession.model));
            })
            .catch(reason => {
                console.log(reason);
                res.status(500).send(reason);
            });
    }
});

server.post("/api/login", express.json(), (req, res) => {
    /**
     * @type {SRPAuthenticationBundle}
     */
    const bundle = req.body;
    if (bundle == null)
        res.status(400).send("SRPAuthenticationBundle must be provided in body of request!");
    else if (bundle.publicValue == null || (typeof bundle.publicValue) !== "string")
        res.status(400).send("Invalid parameter 'bundle.publicValue'!");
    else if (bundle.checksum == null || (typeof bundle.checksum) !== "string")
        res.status(400).send("Invalid parameter 'bundle.checksum'!");
    else if (bundle.username == null || (typeof bundle.username) !== "string")
        res.status(400).send("Invalid parameter 'bundle.username'!");
    else if (bundle.cipherText == null || (typeof bundle.cipherText) !== "string")
        res.status(400).send("Invalid parameter 'bundle.cipherText'!");
    else
    {
        SRPSession.resumeServerSession(bundle.username)
            .then(session => {
                return session.authenticateClient(bundle);
            })
            .then(authenticated => {
                if (authenticated)
                    res.status(200).send("SUCCESS!");
                else
                    res.status(401).send("ACCESS DENIED!");
            })
            .catch(reason => {
                console.log(reason);
                res.status(500).send(reason);
            });
    }
});


server.listen(8080, () => console.log("Listening on port 8080..."));
