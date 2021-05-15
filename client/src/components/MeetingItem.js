import React from "react";

function MeetingItem({start, end, location, subject}) {
    return (
        <div>
            <hr/>
            <p>Location: {location}</p>
            <p>Subject: {subject}</p>
            <p>Start: {start}</p>
            <p>End: {end}</p>
        </div>
    )
}

export default MeetingItem
