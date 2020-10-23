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
 * on 10/16/2020 at 3:19 PM
 */

import SRPSession, { SRPAuthenticationBundle, SRPClientModel, SRPClientSession, SRPServerModel, SRPServerSession } from "srp-node";


/***********************************
 *                                 *
 *           Client side           *
 *                                 *
 ***********************************/

function clientRegistration(username: string, password: string): Promise<void>
{
    return new Promise((resolve) => {
        console.log(`Client: Registering new user "${username}"`);
        // Register the client. This needs to be performed anytime a new user is created or their password is changed
        SRPSession.registerNewClient(username, password)
            .then((clientModel: SRPClientModel) => {
                console.log(`Client: Submitting SRPClientModel to server for new user "${username}"`);
                // Submit "clientModel" to server and save to database
                registerClient(username, clientModel);
                resolve();
            })
            .catch(reason => console.log(reason));
    });
}

function clientAuthentication(username: string, password: string)
{
    console.log(`Client: Requesting SRPServerModel from server for user "${username}"`);
    // Get the SRPServerModel from the server
    getServerModel(username)
        .then((serverModel: SRPServerModel) => {
            console.log(`Client: Starting a new client session for user "${username}"`);
            // Start a new client session
            return SRPSession.newClientSession(password, serverModel);
        })
        .then((clientSession: SRPClientSession) => {
            console.log(`Client: Creating an SRPAuthenticationBundle for user "${username}"`);
            // Create an SRPAuthenticationBundle
            return clientSession.makeAuthenticationBundle();
        })
        .then((authBundle: SRPAuthenticationBundle) => {
            console.log(`Client: Submitting an SRPAuthenticationBundle to server`);
            // Submit bundle to server
            authenticateClient(authBundle);
        })
        .catch(reason => console.log(reason));
}

function readEncryptedMessage(cipherText: string, username: string)
{
    console.log(`Client: Resuming previous client session`);
    let clientSession: SRPClientSession;
    SRPSession.resumeClientSession(username)
        .then(session => {
            clientSession = session;
            console.log(`Client: Decrypting message from server`);
            return clientSession.decrypt(cipherText);
        })
        .then(msg => {
            console.log("\nClient: Decrypted message:");
            console.log(msg);
        })
        .catch(reason => console.log(reason));
}

/***********************************
 *                                 *
 *           Server side           *
 *                                 *
 ***********************************/

const userDB: Map<string, SRPClientModel> = new Map();

function registerClient(username: string, clientModel: SRPClientModel)
{
    console.log(`Server: Saving user "${username}" to database`);
    userDB.set(username, clientModel);
}

function getServerModel(username: string): Promise<SRPServerModel>
{
    console.log(`Server: Client requests server model for user "${username}"`);
    return new Promise((resolve, reject) => {
        if (!userDB.has(username))
        {
            reject(`User "${username}" not found!`);
            return;
        }
        console.log(`Server: Starting new server session for user "${username}"`);
        // Start a new session. If a previous session has already been started, it should be destroyed before making another session
        SRPSession.newServerSession(userDB.get(username)!!)
            .then((serverSession: SRPServerSession) => {
                resolve(serverSession.model);
            })
            .catch(reason => reject(reason));
    });
}

function authenticateClient(authBundle: SRPAuthenticationBundle)
{
    let serverSession: SRPServerSession;
    console.log(`Server: Resuming server session for user "${authBundle.username}"`);
    SRPSession.resumeServerSession(authBundle.username)
        .then((session: SRPServerSession) => {
            serverSession = session;
            console.log(`Server: Authenticating user "${authBundle.username}"`);
            return serverSession.authenticateClient(authBundle);
        })
        .then(authenticated => {
            if (authenticated)
            {
                console.log("\nServer: Access Granted! :)");
                serverSession.encrypt("Hello Client!")
                    .then((cipherText: string) => {
                        console.log("\nServer: Encrypted message:");
                        console.log(JSON.parse((cipherText)));
                        readEncryptedMessage(cipherText, authBundle.username);
                    })
                    .catch(reason => console.log(reason));
            }
            else
                console.log("Server: Access DENIED! :(");
        })
        .catch(reason => console.log(reason));
}


function start()
{
    const username = "admin";
    const password = "password123";
    clientRegistration(username, password)
        .then(() => {
            clientAuthentication(username, password);
        })
        .catch(reason => console.log(reason));
}

start();
