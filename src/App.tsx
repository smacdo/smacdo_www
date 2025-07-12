import {DiGithubBadge} from 'react-icons/di'

import './App.css'

import Copyright from "./components/Copyright";
import Route from "./components/Route.tsx";
import {HTMLAttributes, useEffect, useRef} from "react";
import {not_null} from "./lib/utils.tsx";
import {BlockBreaker} from "./games/blockbreaker";
import MastheadPageLink from "./components/Masthead";
import PageLink from './components/PageLink.tsx';
import useWindowPath from "./hooks/UseWindowPath.ts";


function App() {
    return (
        <div>
            <Header/>

            <Route path="/">
                <p>Hello there!</p>
                <p>Would you like to <PageLink path="games">play a game?</PageLink></p>
            </Route>

            <Route path="/games">
                <BlockBreaker/>
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
    const [windowPath] = useWindowPath();

    return (
        <header role="banner">
            <Cloud start_x={10} start_y={2}/>
            <nav role="navigation">
                <span id="sitename">{windowPath === "/" ? "" : "< "}<a
                    href="/">smacdo.com</a></span>
                <MastheadPageLink name="Code" path="code"/>
                <MastheadPageLink name="Games" path="games"/>
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