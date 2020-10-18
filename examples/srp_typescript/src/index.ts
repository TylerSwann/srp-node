/*
 * Copyright (C) 2019-2020 Tyler Swann - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Tyler Swann <tyler.swann94@gmail.com>
 * on 10/16/2020 at 3:19 PM
 */
import SRPSession, { SRPAuthenticationBundle, SRPClientModel }  from "srp-node";
import express from 'express';


/***********************************
 *                                 *
 *           Client side           *
 *                                 *
 ***********************************/

function register(username: string, password: string)
{
    // Register client.
    SRPSession.registerNewClient(username, password)
        .then(clientModel => {
            // Save clientModel server side
            const params = {
                method: "PUT",
                body: JSON.stringify(clientModel),
                headers: {"Content-Type": "application/json"}
            };
            return fetch("/register", params)
        })
        .catch(reason => console.log(reason));
}

function authenticate(username: string, password: string)
{
    // Get SRPServerModel from server, get password from user
    fetch(`/get-server-model/${username}`)
        .then(res => res.json())
        .then(clientModel => {
            return SRPSession.newClientSession(password, clientModel);
        })
        .then(clientSession => {
            // Client side: Provide server with authBundle.
            const authBundle = clientSession.makeAuthenticationBundle();
            const params = {
                method: "POST",
                body: JSON.stringify(authBundle),
                headers: {"Content-Type": "application/json"}
            };
            return fetch("/auth", params);
        })
        .catch(reason => console.log(reason));
}


/***********************************
 *                                 *
 *           Server side           *
 *                                 *
 ***********************************/

const server = express();

const userDB = new Map<string, SRPClientModel>();

server.put("/register", express.json(), (req, res) => {
    const clientModel: SRPClientModel = req.body;
    if (userDB.has(clientModel.username))
        res.status(401).send("User already exists!");
    else
        userDB.set(clientModel.username, clientModel);
});

server.get("/get-server-model/:username", (req, res) => {
    const username = req.params.username;
    if (!userDB.has(username))
        res.status(404).send("User not found!");
    else
    {
        const clientModel = userDB.get(username);
        SRPSession.newServerSession(clientModel!!)
            .then(serverSession => {
                res.status(200).send(JSON.stringify(serverSession.model));
            })
            .catch(reason => res.status(500).send(reason));
    }
});

server.post("/auth", (req, res) => {
    const authBundle: SRPAuthenticationBundle = req.body;
    SRPSession.resumeServerSession(authBundle.username)
        .then(serverSession => {
            return serverSession.authenticateClient(authBundle);
        })
        .then(authenticated => {
            if (authenticated)
                res.status(200).send("Access Granted!");
            else
                res.status(400).send("Access DENIED!");
        })
        .catch(reason => res.status(500).send(reason));
});

