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
 * on 09/04/2020 at 4:19 PM
 */

import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Form from "./Form";
import SRPSession from "srp-node";
import Dashboard from "./Dashboard";



function NotFound()
{
    return (
        <div style={{textAlign: "center", marginTop: "40vh"}}>
            <h2 style={{fontSize: "26px"}}>Not Found!!</h2>
        </div>
    );
}


class App extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            registerDisabled: false,
            loginDisabled: false,
            output: []
        };
    }

    render()
    {
        const { registerDisabled, loginDisabled, output } = this.state;
        const username = "Tyler";
        return (
            <Router>
                <div>
                    <Switch>
                        <Route exact path={"/"}>
                            <Form output={output}
                                  title={"Register"}
                                  linkText={"Sign In!"}
                                  href={"/login"}
                                  disabled={registerDisabled}
                                  linkLabel={"Already have an account?"}
                                  onInput={(u, p) => this.register(u, p)}/>
                        </Route>
                        <Route exact path={"/login"}>
                            <Form title={"Login"}
                                  output={output}
                                  linkText={"Sign up!"}
                                  href={"/"}
                                  disabled={loginDisabled}
                                  linkLabel={"Don't have an account?"}
                                  onInput={(u, p) => this.login(u, p)}/>
                        </Route>
                        <Route exact path={"/dashboard"}>
                            <Dashboard active={"Home"} username={username}/>
                        </Route>
                        <Route exact path={"/dashboard/about"}>
                            <Dashboard active={"About"} username={username}/>
                        </Route>
                        <Route exact path={"/dashboard/store"}>
                            <Dashboard active={"Store"} username={username}/>
                        </Route>
                        <Route exact path={"/dashboard/profile"}>
                            <Dashboard active={"Profile"} username={username}/>
                        </Route>
                        <Route render={() => <NotFound/>}/>
                    </Switch>
                </div>
            </Router>
        );
    }

    register(username, password)
    {
        this.setState({registerDisabled: true});
        try
        {
            this.appendOutput("SRPSession.registerNewClient:\n");
            SRPSession.registerNewClient(username, password)
                .then(clientModel => {
                    this.appendOutput(clientModel);
                    const body = JSON.stringify(clientModel);
                    this.appendOutput("POST /api/register");
                    fetch("/api/register", {method: "POST", body: body, headers: {"Content-Type": "application/json"}})
                        .then(res => {
                            if (res.status !== 200)
                            {
                                alert("Failed to register client");
                                res.text()
                                    .then(msg => console.log(msg))
                                    .catch(reason => console.log(reason));
                                this.setState({registerDisabled: false});
                            }
                            else
                            {
                                alert(`Registered user '${username}' successfully!`);
                            }
                        })
                        .catch(reason => console.log(reason));
                })
                .catch(reason => console.log(reason));
        }
        catch (e) { console.log(e); }
    }

    login(username, password)
    {
        SRPSession.destroyClientSession(username);
        /**
         * @type {SRPClientSession}
         */
        let session;
        this.appendOutput(`GET /api/auth-params/${username}\n`);
        fetch(`/api/auth-params/${username}`, {method: "GET"})
            .then(res => {
                if (res.status !== 200)
                {
                    res.text()
                        .then(msg => {
                            console.log(msg);
                            alert(msg);
                        })
                        .catch(reason => console.log(reason));
                    return;
                }
                res.json()
                    .then(params => {
                        /**
                         * @type {SRPServerModel}
                         */
                        const model = params;
                        this.appendOutput(model);
                        this.appendOutput(`SRPSession.newClientSession\n`);
                        return SRPSession.newClientSession(password, model);
                    })
                    .then(client => {
                        session = client;
                        this.appendOutput(`\nClient Session: \n`);
                        this.appendOutput(client);
                        this.appendOutput(`session.makeAuthenticationBundle\n`);
                        return session.makeAuthenticationBundle();
                    })
                    .then(bundle => {
                        const body = JSON.stringify(bundle);
                        this.appendOutput(bundle);
                        this.appendOutput(`POST /api/login\n`);
                        return fetch("/api/login", {method: "POST", body: body, headers: {"Content-Type": "application/json"}});
                    })
                    .then(res2 => {
                        if (res2.status !== 200)
                        {
                            res2.text()
                                .then(msg => {
                                    console.log(msg);
                                    alert(msg);
                                })
                                .catch(reason => console.log(reason));
                            return;
                        }
                        else
                        {
                            alert("LOGIN SUCCESS!");
                        }
                    })
                    .catch(reason => console.log(reason));
            })
            .catch(reason => console.log(reason));
    }

    appendOutput(item)
    {
        const output = Array.from(this.state.output);
        if (typeof item === "object")
            output.push(JSON.stringify(item, null, 4));
        else
            output.push(item);
        this.setState({output: output});
    }
}

export default App;
