import React from "react";

function RecommendedUser({user}) {
    let interests = user['interests'].map(i => <p>- {i}</p>)
    return (
        <div>
            <hr/>
            <p>Name: {user['name']}</p>
            <p>Interests:</p>
            {interests}
        </div>
    )
}

export default RecommendedUser
