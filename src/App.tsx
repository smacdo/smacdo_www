import {DiGithubBadge} from 'react-icons/di'
import {MdOutlineDarkMode, MdOutlineLightMode} from "react-icons/md";

import {useEffect, useState} from "react";

import './App.css'

const useIsDarkModeDetector = () => {
    const getPrefersDarkMode = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkTheme, setIsDarkTheme] = useState(getPrefersDarkMode());
    const onColorSchemeChanged = (e => {
        setIsDarkTheme(e.matches);
    });

    useEffect(() => {
        const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        darkThemeMediaQuery.addListener(onColorSchemeChanged);
        return () => darkThemeMediaQuery.removeListener(onColorSchemeChanged);
    }, []);

    return isDarkTheme;
}

function CurrentThemeIcon() {
    const isDarkTheme = useIsDarkModeDetector();
    return isDarkTheme ? <MdOutlineDarkMode/> : <MdOutlineLightMode/>;
}

function App() {
    return (
        <div className="col-lg-8 mx-auto p-4">
            <Header/>

            <main role="main">
                <p>[stuff goes here...]</p>
            </main>

            <Footer/>
        </div>
    )
}

function Header() {
    return (
        <header className="masthead" role="banner">
            <nav className="navbar" role="navigation">
                <div id="logo">
                    <a href="/">smacdo.com</a>
                </div>

                <ul id="menu">
                    <li><a href="/">Home</a></li>
                    <li><span>About</span></li>
                    <li>Contact</li>
                    <li>Projects</li>
                    <li>
                        <CurrentThemeIcon/>
                    </li>
                </ul>
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
            <div>
                Copyright &copy; 2025 Scott MacDonald
            </div>
        </footer>
    )
}

export default App
