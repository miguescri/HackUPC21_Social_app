import React, {useState} from "react";
import Api from "../Api";

function Login({setToken}) {
    const [email, setEmail] = useState('')
    const [pwd, setPwd] = useState('')
    const [validCredentials, setValidCredentials] = useState(true)

    let errorMessage = !validCredentials ? <p>Wrong credentials</p> : ''

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

    return (
        <div>
            <h1>Login</h1>

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
}

export default Login
