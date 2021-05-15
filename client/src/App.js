import React, {useState} from "react";
import Login from "./components/Login"

function App() {
    const [token, setToken] = useState(null)
    let component

    if (token) {
        component = (
            <div>
                <p>I'm logged</p>
                <button onClick={(e) => {
                    e.preventDefault()
                    setToken(null)
                }}>Log out</button>
            </div>
        )
    } else {
        component = <Login setToken={setToken}/>
    }

    return (
        <div>
            {component}
        </div>
    )
}

export default App
