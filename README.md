# srp-node

Secure Remote Password 6a node implementation based on RFC5054. Can be used both client side and server side. Relies on the Stanford Javascript Crypto Library (SJCL)
which is included in the "lib" folder.

SRP is an augmented password-authenticated key agreement (PAKE) protocol. It provides the following benefits:
* Allows a client to be authenticated without their password being sent to the server or being stored server side as a hash. Instead, the client proves to the server that it knows the password.
* Can be used as the authentication component in end-to-end encrypted systems.

## Installation
```bash
npm install srp-node
```
## Usage
### Registering new clients
```typescript
    // Register client.
    SRPSession.registerNewClient(username, password)
        .then(clientModel => {
            // Save clientModel to database
            const params = {
                method: "PUT",
                body: JSON.stringify(clientModel),
                headers: {"Content-Type": "application/json"}
            };
            return fetch("/register", params)
        })
        .catch(reason => console.log(reason));
```
### Authentication

```typescript
    // Get SRPServerModel from server, get password from user
    fetch(`/get-server-model/${username}`)
        .then(res => res.json())
        .then(clientModel => {
            return SRPSession.newClientSession(password, clientModel);
        })
        .then(clientSession => {
            // Create an SRPAuthenticationBundle
            const authBundle = clientSession.makeAuthenticationBundle();
            const params = {
                method: "POST",
                body: JSON.stringify(authBundle),
                headers: {"Content-Type": "application/json"}
            };
            // Provide server with bundle.
            return fetch("/auth", params);
        })
        .catch(reason => console.log(reason));
````
Start a new session server side when the user requests the SRPServerModel
```typescript
server.get("/get-server-model/:username", (req, res) => {
    const username = req.params.username;
    if (!userDB.has(username))
        res.status(404).send("User not found!");
    else
    {
        const clientModel = userDB.get(username);
        // Start the server session using the SRPClientModel from the database
        SRPSession.newServerSession(clientModel)
            .then(serverSession => {
                // Provide the client with the SRPServerModel
                res.status(200).send(JSON.stringify(serverSession.model));
            })
            .catch(reason => res.status(500).send(reason));
    }
});
```
Using the SRPAuthenticationBundle provided by the client, resume the session and authenticate the client
```typescript
server.post("/auth", (req, res) => {
    let session: SRPServerSession;
    const authBundle: SRPAuthenticationBundle = req.body;
    SRPSession.resumeServerSession(authBundle.username)
        .then(serverSession => {
            session = serverSession;
            return session.authenticateClient(authBundle);
        })
        .then(authenticated => {
            // session.preMasterKey can then be used as a symmetric ephemeral key
            if (authenticated)
                res.status(200).send("Access Granted!");
            else
                res.status(400).send("Access DENIED!");
        })
        .catch(reason => res.status(500).send(reason));
});

```

