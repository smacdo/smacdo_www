import { useState } from 'react'
import { DiGithubBadge  } from 'react-icons/di';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <div>
            <h1>smacdo.com</h1>
            <p>[stuff...]</p>
        </div>

        <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
        </div>

        <div className="footer">
            <DiGithubBadge /> <a href="https://github.com/smacdo/">smacdo</a>
        </div>
    </>
  )
}

export default App
