import {useState} from 'react'
import {DiGithubBadge} from 'react-icons/di'
import {Button} from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
    const [showGame, setShowGame] = useState<boolean>(false)

    return (
        <>
            <div className="main-content" id="home">
                <h1>smacdo.com</h1>
                <p>[stuff...]</p>

                <div className="card">
                    <Button variant="secondary" className="mr-1" onClick={() => setShowGame(!showGame)}>
                        Play a game!
                    </Button>
                </div>
            </div>

            {showGame ? <TicTacToeGame/> : null}

            <Footer/>
        </>
    )
}

function TicTacToeGame() {
    return (
        <div className="main-content" id="TicTacToeGame">
            <h4 className="modal-title">TIC TAC TOE!</h4>
        </div>
    )
}

function Footer() {
    return (
        <div className="footer">
            <DiGithubBadge/> <a href="https://github.com/smacdo/">smacdo</a>
        </div>
    )
}

export default App
