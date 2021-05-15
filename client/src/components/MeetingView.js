import React, {useState} from "react";
import MeetingCreate from "./MeetingCreate";
import MeetingList from "./MeetingList";
import MeetingJoin from "./MeetingJoin";

const ACTION_LIST = 0
const ACTION_CREATE = 1
const ACTION_JOIN = 2

function MeetingView() {
    const [action, setAction] = useState(ACTION_LIST)
    let actionComponent

    if (action === ACTION_LIST) {
        actionComponent = <MeetingList/>
    } else if (action === ACTION_CREATE) {
        actionComponent = <MeetingCreate/>
    } else if (action === ACTION_JOIN) {
        actionComponent = <MeetingJoin/>
    }

    return (
        <div>
            <div>
                <h1>Meetings</h1>
                <button onClick={(e) => {
                    e.preventDefault()
                    setAction(ACTION_LIST)
                }}>
                    List
                </button>
                <button onClick={(e) => {
                    e.preventDefault()
                    setAction(ACTION_CREATE)
                }}>
                    Create
                </button>
                <button onClick={(e) => {
                    e.preventDefault()
                    setAction(ACTION_JOIN)
                }}>
                    Join
                </button>
            </div>
            {actionComponent}
        </div>
    )
}

export default MeetingView
