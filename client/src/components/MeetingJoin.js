import React, {useState} from "react";

function MeetingJoin({meetingJoined, join, leave}) {
    const [meetingId, setMeetingId] = useState('')
    let component

    if (meetingJoined) {
        component = (
            <div>
                <h2>Meeting created</h2>
                <div>Id: {meetingJoined['id']}</div>
                <div>Location: {meetingJoined['location']}</div>
                <div>Subject: {meetingJoined['subject']}</div>

                <button onClick={(e) => {
                    e.preventDefault()
                    leave()
                }}>
                    Leave
                </button>
            </div>
        )
    } else {
        component = (
            <div>
                <h2>
                    Join a meeting
                </h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    join(meetingId)
                }}>
                    <div>
                        ID:
                        <input
                            type="text"
                            value={meetingId}
                            onChange={(e) => setMeetingId(e.target.value)}/>
                    </div>
                    <input type="submit" value="Join"/>
                </form>
            </div>
        )
    }

    return (
        <div>
            {component}
        </div>
    )
}

export default MeetingJoin
