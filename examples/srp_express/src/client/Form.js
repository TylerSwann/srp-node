/*
 * Copyright (C) 2019-2020 Tyler Swann - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Tyler Swann <tyler.swann94@gmail.com>
 * on 09/05/2020 at 9:10 AM
 */

import React, { Component } from 'react';


class Form extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
        };
    }

    render()
    {
        const { disabled, output, title, href, linkText, linkLabel } = this.props;
        return (
            <div>
                <div id="login-root">
                    <div id="login-container">
                        <div id="login-title">
                            {title}
                        </div>
                        <div id="login-form">
                            <input type="text" name="username" id="username" placeholder="Username"/>
                            <input type="password" name="password" id="password" placeholder="Password"/>
                            <div id="button-container">
                                <button disabled={disabled} onClick={() => this.submit()}>{title}</button>
                                <div className="link">
                                    <div>
                                        {linkLabel}
                                    </div>
                                    <a href={href}>{linkText}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <pre className="output">
                        {output == null ? "" : output.join("\n")}
                    </pre>
                </div>
            </div>
        );
    }

    submit()
    {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        if (username == null || password == null)
            alert("Username & Password require!");
        else if (/$\s*^/.test(username) || /^\s*$/.test(password))
            alert("Invalid username or password!");
        else
        {
            const { onInput } = this.props;
            onInput(username, password);
        }
    }
}

export default Form;
