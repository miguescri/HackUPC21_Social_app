import React, {useState} from "react";
import {buy_pizza, redeem_points} from "../endpoints";

function MarketView({token}) {
    const [user, setUser] = useState(null)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(false)
    let component
    let message

    const refresh = () => redeem_points(token, setUser)
    const buyPizza = () => buy_pizza(token, setSuccess, setError)

    if (success) {
        message = <div>Purchase completed. Enjoy your pizza!</div>
    } else if (error) {
        message = <div>You don't have enough points to buy it...</div>
    }

    if (!user) {
        refresh()
        component = (
            <div>
                Fetching data...
            </div>
        )
    } else {
        component = (
            <div>
                <div>Your points: {user['points']}</div>
                <hr/>
                <div>
                    <h2>Pizza!</h2>
                    <p>Price: 10 points</p>
                    <button onClick={(e) => {
                        e.preventDefault()
                        setSuccess(false)
                        setError(false)
                        buyPizza()
                        refresh()
                    }}>
                        Buy
                    </button>
                    {message}
                </div>
            </div>
        )
    }
    return (
        <div>
            <h1>
                Marketplace
            </h1>
            {component}
        </div>
    )
}

export default MarketView
