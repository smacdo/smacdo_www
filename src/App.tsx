import {DiGithubBadge} from 'react-icons/di'

import './App.css'

import Copyright from "./components/Copyright";
import MastheadPageLink from "./components/Masthead";
import Route from "./components/Route.tsx";
import ThemeIcon from "./components/ThemeIcon";
import Canvas from "./components/Canvas";


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
                    ctx.arc(50, 100, 20 * Math.sin(nowTime / 250) ** 2, 0, 2 * Math.PI)
                    ctx.fill()
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
            <Copyright name="Scott MacDonald"/>
        </footer>
    )
}

export default App