import React, {useState} from "react";
import MeetingCreate from "./MeetingCreate";
import MeetingList from "./MeetingList";
import MeetingJoin from "./MeetingJoin";
import {create_meeting, get_meetings} from "../endpoints"

const ACTION_LIST = 0
const ACTION_CREATE = 1
const ACTION_JOIN = 2

function MeetingView({token}) {
    const [action, setAction] = useState(ACTION_LIST)
    const [meetingsList, setMeetingsList] = useState([])
    const [meetingCreated, setMeetingCreated] = useState(null)
    let actionComponent

    const refresh = () => get_meetings(token, setMeetingsList)
    const create = (hours, location, subject) => create_meeting(token, hours, location, subject, setMeetingCreated)
    const leave_created = () => setMeetingCreated(null)

    if (action === ACTION_LIST) {
        actionComponent = <MeetingList meetings={meetingsList} refresh={refresh}/>
    } else if (action === ACTION_CREATE) {
        actionComponent =
            <MeetingCreate meetingCreated={meetingCreated} createMeeting={create} leaveCreated={leave_created}/>
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
