import React, {useState} from "react";

function MeetingCreate({meetingCreated, createMeeting, leaveCreated}) {
    const [hours, setHours] = useState(0)
    const [location, setLocation] = useState('')
    const [subject, setSubject] = useState('')
    let component

    if (meetingCreated) {
        component = (
            <div>
                <h2>Meeting created</h2>
                <div>Id: {meetingCreated['id']}</div>
                <div>Location: {meetingCreated['location']}</div>
                <div>Subject: {meetingCreated['subject']}</div>

                <button onClick={(e) => {
                    e.preventDefault()
                    leaveCreated()
                }}>
                    Leave
                </button>
            </div>
        )
    } else {
        component = (
            <div>
                <h2>
                    Create a meeting
                </h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    createMeeting(hours, location, subject)
                }}>
                    <div>
                        Hours:
                        <input
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}/>
                    </div>
                    <div>
                        Location:
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}/>
                    </div>
                    <div>
                        Subject:
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}/>
                    </div>
                    <input type="submit" value="Create"/>
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

export default MeetingCreate
