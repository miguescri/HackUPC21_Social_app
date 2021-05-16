import React, {useState} from "react";
import Login from "./components/Login"
import MeetingView from "./components/MeetingView";
import ProfileView from "./components/ProfileView";
import RecommendedView from "./components/RecommendedView";

const MENU_DEFAULT = 0
const MENU_MEETINGS = 1
const MENU_PROFILE = 2
const MENU_RECOMMENDED = 3

function App() {
    const [token, setToken] = useState(null)
    const [menu, setMenu] = useState(MENU_DEFAULT)
    let component
    let menuComponent
    let backComponent

    const back = () => setMenu(MENU_DEFAULT)

    backComponent = (
        <button onClick={(e) => {
            e.preventDefault()
            back()
        }}>
            Back
        </button>
    )

    if (menu === MENU_MEETINGS) {
        menuComponent = <MeetingView token={token}/>
    } else if (menu === MENU_PROFILE) {
        menuComponent = <ProfileView token={token}/>
    } else if (menu === MENU_RECOMMENDED) {
        menuComponent = <RecommendedView token={token}/>
    } else {
        backComponent = ''
        menuComponent = (
            <div>
                <h1>Menu</h1>
                <button onClick={(e) => {
                    e.preventDefault()
                    setMenu(MENU_MEETINGS)
                }}>
                    Meetings
                </button>
                <button onClick={(e) => {
                    e.preventDefault()
                    setMenu(MENU_PROFILE)
                }}>
                    Profile
                </button>
                <button onClick={(e) => {
                    e.preventDefault()
                    setMenu(MENU_RECOMMENDED)
                }}>
                    Recommended new contacts
                </button>
            </div>
        )
    }

    if (token) {
        component = (
            <div>
                <button onClick={(e) => {
                    e.preventDefault()
                    setToken(null)
                    setMenu((MENU_DEFAULT))
                }}>
                    Log out
                </button>
                {backComponent}
                {menuComponent}
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
