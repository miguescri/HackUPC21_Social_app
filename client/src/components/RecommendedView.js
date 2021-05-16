import React, {useState} from "react";
import RecommendedUser from "./RecommendedUser";
import {get_recommendations} from "../endpoints";

function RecommendedView({token}) {
    const [users, setUsers] = useState(null)

    const getUsers = () => get_recommendations(token, setUsers)
    let items
    if (users) {
        items = users.map(user =>
            <RecommendedUser user={user}/>)
    } else {
        getUsers()
    }
    return (
        <div>
            <h2>
                Recommended new contacts
            </h2>
            {items}
        </div>
    )
}

export default RecommendedView
