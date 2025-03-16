import * as React from 'react';
import {useEffect, useState} from 'react';

import {DiGithubBadge} from 'react-icons/di'

import {ThemeIcon} from "./components/ThemeIcon";
import './App.css'

interface RouteProps {
    children?: React.ReactNode;
    path: string,
}

function useWindowPath() {
    const [windowPath, setWindowPath] = useState(window.location.pathname);

    useEffect(() => {
        const onLocationChange = () => {
            setWindowPath(window.location.pathname);
        };

        window.addEventListener('popstate', onLocationChange);

        return () => {
            window.removeEventListener('popstate', onLocationChange);
        };
    }, []);

    return [windowPath, setWindowPath];
}

/// Displays the children elements when the page's URL matches the route path, otherwise nothing is
/// rendered.
function Route(props: RouteProps): React.ReactNode {
    const [windowPath] = useWindowPath();

    // Render the child element when `props.path` matches the current URL, otherwise do not render
    // the element.
    return windowPath === props.path ? (
        <main role="main">
            {props.children}
        </main>
    ) : null;
}

/// Display a link to a route on the page masthead.
function MastheadPageLink({name, path}: { name: string, path: string }) {
    const [windowPath] = useWindowPath();

    return (
        <li>{windowPath !== path ?
            <a href={path} onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                // Use the default behavior of opening a link in a new window when the appropriate
                // keyboard button is pressed.
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                    return;
                }

                // Stop default behavior of browsing following the link and reloading the page.
                event.preventDefault();

                // Manually change the current page's URL to the masthead path.
                window.history.pushState({}, "", path);

                // Communicate to any active event listeners that the URL has changed.
                window.dispatchEvent(new PopStateEvent('popstate'));
            }}>{name}</a> : <span>{name}</span>
        }</li>
    )
}

function App() {
    return (
        <div className="col-lg-8 mx-auto p-4">
            <Header/>

            <Route path="/">
                <p>[stuff goes here...]</p>
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

function Header() {
    return (
        <header className="masthead" role="banner">
            <nav className="navbar" role="navigation">
                <div id="logo">
                    <a href="/">smacdo.com</a>
                </div>

                <ul id="menu">
                    <MastheadPageLink name="Home" path="/"/>
                    <MastheadPageLink name="About" path="/about"/>
                    <MastheadPageLink name="Contact" path="/contact"/>
                    <MastheadPageLink name="Projects" path="/projects"/>
                    <li>
                        <ThemeIcon/>
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
