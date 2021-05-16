import React, {useState} from "react";
import {add_interests, redeem_points} from "../endpoints";

function ProfileView({token}) {
    const [user, setUser] = useState(null)
    const [newInterest, setNewInterest] = useState('')
    let component

    const refresh = () => redeem_points(token, setUser)
    const addNewInterest = (interest) => add_interests(token, [interest], setUser)

    if (!user) {
        refresh()
        component = (
            <div>
                Fetching data...
            </div>
        )
    } else {
        let interests = user['interests'].map(i => <p>- {i}</p>)
        component = (
            <div>
                <div>Name: {user['name']}</div>
                <div>Email: {user['email']}</div>
                <div>Points: {user['points']}</div>
                <div>Interests: {interests}</div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    addNewInterest(newInterest);
                    setNewInterest('')
                }}>
                    <div>
                        New interest:
                        <input
                            type="text"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}/>
                    </div>
                    <input type="submit" value="Add"/>
                </form>
            </div>
        )
    }
    return (
        <div>
            <h1>
                Profile
            </h1>
            {component}
        </div>
    )
}

export default ProfileView
