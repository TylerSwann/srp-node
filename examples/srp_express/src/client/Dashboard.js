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
 * on 10/14/2020 at 4:46 PM
 */

import React, { Component } from 'react';


class Dashboard extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            dropDownOpen: false
        };
    }

    componentDidMount()
    {
        this.onWindowClick = e => {
            setTimeout(() => {
                const { dropDownOpen } = this.state;
                if (!dropDownOpen)
                    return;
                if (e.path != null)
                {
                    const paths = Array.from(e.path);
                    let isProfileButton = false;
                    for (let i = 0; i < paths.length; i++)
                    {
                        if (paths[i].className != null && paths[i].className === "profile-button")
                        {
                            isProfileButton = true;
                            return;
                        }
                    }
                    if (!isProfileButton)
                        this.setState({dropDownOpen: false});
                }
            }, 0);
        };
        window.addEventListener("click", this.onWindowClick);
    }

    componentWillUnmount()
    {
        window.removeEventListener("click", this.onWindowClick);
    }

    render()
    {
        const { active, username } = this.props;
        const { dropDownOpen } = this.state;

        return (
            <div>
                <div className="app-bar">
                    <div className="location">
                        {active}
                    </div>
                    <a href={"/dashboard"}>
                        <button className={active === "Home" ? "app-button active" : "app-button"}>
                            Home
                        </button>
                    </a>
                    <a href={"/dashboard/about"}>
                        <button className={active === "About" ? "app-button active" : "app-button"}>
                            About
                        </button>
                    </a>
                    <a href={"/dashboard/store"}>
                        <button className={active === "Store" ? "app-button active" : "app-button"}>
                            Store
                        </button>
                    </a>
                    <a href={"/dashboard/profile"}>
                        <button className={active === "Profile" ? "app-button active" : "app-button"}>
                            Profile
                        </button>
                    </a>
                    <div className="profile-button">
                        <button className={"active"} onClick={() => this.setState({dropDownOpen: !dropDownOpen})}>
                            <span>
                                {username}
                            </span>
                            <svg viewBox="0 0 24 24" className={"drop-down-icon"}>
                                <g>
                                    <path d="M20.207 8.147c-.39-.39-1.023-.39-1.414 0L12 14.94 5.207 8.147c-.39-.39-1.023-.39-1.414 0-.39.39-.39 1.023 0 1.414l7.5 7.5c.195.196.45.294.707.294s.512-.098.707-.293l7.5-7.5c.39-.39.39-1.022 0-1.413z"/>
                                </g>
                            </svg>
                        </button>
                        <div className={dropDownOpen ? "logout-dropdown open" : "logout-dropdown"}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                            <button className="logout">Logout</button>
                        </div>
                    </div>
                </div>
                <div className="dashboard-content">
                    <div className="dashboard-imgs">
                        <img src="https://picsum.photos/200/300?1" alt=""/>
                        <img src="https://picsum.photos/200/300?2" alt=""/>
                        <img src="https://picsum.photos/200/300?3" alt=""/>
                        <img src="https://picsum.photos/200/300?4" alt=""/>
                        <img src="https://picsum.photos/200/300?5" alt=""/>
                        <img src="https://picsum.photos/200/300?6" alt=""/>
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
