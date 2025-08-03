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
    delay_time_ms: number;
    start_y: number;
}

function Cloud({delay_time_ms, start_y}: CloudProps) {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = not_null(elementRef.current);
        element.animate([
            {
                left: "-203px",  // Start the cloud offscreen based on the width of the sprite.
            },
            {
                left: "100%",
            }
        ], {
            duration: 300000,
            iterations: Number.POSITIVE_INFINITY,
            delay: delay_time_ms,
        });
    });

    return (
        <span ref={elementRef} className="cloud" style={{top: start_y}}/>
    );
}

function Header() {
    const [windowPath] = useWindowPath();

    return (
        <header role="banner">
            <Cloud delay_time_ms={0} start_y={50}/>
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