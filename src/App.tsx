import {useState} from 'react'
import {DiGithubBadge} from 'react-icons/di'
import {Button} from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
    const [showGame, setShowGame] = useState<boolean>(false)

    return (
        <>
            <Header/>
            <div className="container">
                <p>[stuff...]</p>
            </div>

            <div className="container">
                <Button variant="secondary" className="mr-1" onClick={() => setShowGame(!showGame)}>
                    Play a game!
                </Button>
            </div>

            {showGame ? <TicTacToeGame/> : null}

            <Footer/>
        </>
    )
}

function TicTacToeGame() {
    return (
        <div className="container">
            <h4 className="modal-title">TIC TAC TOE!</h4>
        </div>
    )
}

function Header() {
    return (
        <div className="container">
            <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
                <a href="/"
                   className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                    <span className="fs-4">smacdo.com</span>
                </a>
                <ul className="nav nav-pills">
                    <li className="nav-item">
                        <a href="#" className="nav-link active" aria-current="page">Home</a>
                    </li>
                </ul>

            </header>
        </div>
    )
}

function Footer() {
    return (
        <div className="container">
            <div className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
                <div className="col-md-4 d-flex align-items-center">(C) Scott MacDonald</div>
                <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
                    <li className="ms-3"><DiGithubBadge/></li>
                </ul>
            </div>
        </div>

    )
}

export default App
