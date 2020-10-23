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
 * on 10/23/2020 at 3:27 PM
 */

import React, { Component } from 'react';


class OutputContainer extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            height: 200
        };
        this.handle = React.createRef();
        this.pre = React.createRef();
        this.startY = 0;
        this.startHeight = 0;
        this.dragging = false;
    }

    componentDidMount()
    {
        window.addEventListener("mousemove", this.handleMouseMove.bind(this));
        window.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    componentWillUnmount()
    {
        window.removeEventListener("mousemove", this.handleMouseMove.bind(this));
        window.removeEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    render()
    {
        const { output } = this.props;
        const { height } = this.state;

        return (
            <div className={"output-container"}>
                <div className="handle"
                     ref={this.handle}
                     onMouseDown={e => this.handleMouseDown(e)}>
                    &nbsp;
                </div>
                <pre className="output"
                     ref={this.pre}
                     style={{height: `${height}px`}}>
                        {output == null ? "" : output.join("\n")}
                </pre>
            </div>
        );
    }

    /**
     * @param e {MouseEventHandler<HTMLDivElement>}
     */
    handleMouseDown(e)
    {
        const handleRect = this.handle.current.getBoundingClientRect();
        const preRect = this.pre.current.getBoundingClientRect();
        this.startY = handleRect.y;
        this.startHeight = preRect.height;
        this.dragging = true;
    }

    /**
     * @param e {MouseEvent}
     */
    handleMouseMove(e)
    {
        if (!this.dragging)
            return;
        this.setState({
            height: this.startHeight - e.clientY + this.startY
        });
    }

    /**
     * @param e {MouseEventHandler<HTMLDivElement>}
     */
    handleMouseUp(e)
    {
        this.dragging = false;
    }
}

export default OutputContainer;
