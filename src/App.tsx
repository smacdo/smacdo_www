import {DiGithubBadge} from 'react-icons/di'

import './App.css'

import Copyright from "./components/Copyright";
import Route from "./components/Route.tsx";
import Canvas from "./components/Canvas";
import {HTMLAttributes, useEffect, useRef} from "react";
import {not_null} from "./utils.tsx";


function App() {
    return (
        <div>
            <Header/>

            <Route path="/">
                <p>[stuff goes here...]</p>
                <Canvas width={800} height={600} onDraw={(ctx, nowTime, _deltaTime) => {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                    ctx.fillStyle = '#A4DC7B'
                    ctx.beginPath()
                    ctx.arc(50, 100, 20 * Math.sin(nowTime / 2500) ** 2, 0, 2 * Math.PI)
                    ctx.fill()

                    ctx.font = "72px Georgia, Helvetica, Arial, sans-serif";
                    ctx.fillStyle = '#4A4A4A';
                    ctx.fillText("Hello World", 100, 100);
                }}/>
            </Route>

            <Route path="/about">
                <p>[about goes here...]</p>
            </Route>

            <Route path="/contact">
                <p>[contact goes here...]</p>
            </Route>

            <Route path="/projects">
                <p>[projects go here...]</p>
            </Route>


            <Footer/>
        </div>
    )
}

interface CloudProps extends HTMLAttributes<HTMLElement> {
    start_x: number;
    start_y: number;
}

function Cloud({start_x, start_y}: CloudProps) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Determine where the sprite starts on the timeline by measuring the requested start_x
        // against the browser window's width.
        const start_left = (window.innerWidth >= start_x ? start_x / window.innerWidth : 1);

        const element = not_null(elementRef.current);
        element.animate([
            {
                left: "0%",
            },
            {
                left: "100%",
            }
        ], {
            duration: 300000,
            iterations: Number.POSITIVE_INFINITY,
            iterationStart: start_left,
        });
    });

    return (
        <span ref={elementRef} className="cloud" style={{left: start_x, top: start_y}}/>
    );
}

function Header() {
    return (
        <header className="masthead" role="banner">
            <Cloud start_x={10} start_y={2}/>
            <nav className="navbar" role="navigation">
                <div id="logo">
                    <a href="/">smacdo.com</a>
                </div>
            </nav>
        </header>
    )
}

function Footer() {
    return (
        <footer className="main-footer" role="contentinfo">
            <div id="badges">
                <a href="https://github.com/smacdo" target="_blank" className="badgelink">
                    <DiGithubBadge size={32}/>
                </a>
            </div>
            <Copyright name="Scott MacDonald"/>
        </footer>
    )
}

export default App