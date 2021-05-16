import React, {useState} from "react";
import Api from "../Api";

const MODE_LOGIN = 0
const MODE_SIGNUP = 1

function Login({setToken}) {
    const [mode, setMode] = useState(MODE_LOGIN)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [pwd, setPwd] = useState('')
    const [validCredentials, setValidCredentials] = useState(true)

    let errorMessage = !validCredentials ? <p>Wrong credentials</p> : ''
    let component

    const login = () => {
        let searchParams = new URLSearchParams();

        searchParams.append('username', email);
        searchParams.append('password', pwd);

        fetch(Api + '/token',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: searchParams
            })
            .then(response => {
                if (response.ok) {
                    setValidCredentials(true)
                    response.json().then(data => {
                        setToken(data['access_token'])
                    })
                } else {
                    setValidCredentials(false)
                    setEmail('')
                    setPwd('')
                }
            })
    }

    const signup = () => {
        let body = {email: email, password: pwd, name: name}

        fetch(Api + '/user',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(body)
            })
            .then(response => {
                if (response.ok) {
                    login()
                } else {
                    setValidCredentials(false)
                }
            })
    }

    if (mode === MODE_LOGIN) {
        component = (
            <div>
                <h1>Login</h1>
                <button onClick={(e) => {
                    e.preventDefault()
                    setMode(MODE_SIGNUP)
                }}>
                    Switch to Signup
                </button>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    login()
                }}>
                    <div>
                        Email:
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div>
                        Password:
                        <input
                            type="password"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}/>
                    </div>
                    <input type="submit" value="Login"/>
                </form>
                {errorMessage}
            </div>
        )
    } else {
        component = (
            <div>
                <h1>Signup</h1>
                <button onClick={(e) => {
                    e.preventDefault()
                    setMode(MODE_LOGIN)
                }}>
                    Switch to Login
                </button>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    signup()
                }}>
                    <div>
                        Email:
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div>
                        Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div>
                        Password:
                        <input
                            type="password"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}/>
                    </div>
                    <input type="submit" value="Signup"/>
                </form>
                {errorMessage}
            </div>
        )
    }

    return (
        <div>
            {component}
        </div>
    )
}

export default Login
