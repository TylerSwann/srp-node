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
 * on 09/05/2020 at 9:10 AM
 */

import React, { Component } from 'react';
import OutputContainer from "./OutputContainer";


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
                    <OutputContainer output={output}/>
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
