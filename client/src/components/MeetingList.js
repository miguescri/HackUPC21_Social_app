import React, {useState} from "react";
import MeetingItem from "./MeetingItem";

function MeetingList({meetings, refresh}) {
    let items
    if (meetings) {
        items = meetings.map(m =>
            <MeetingItem
                start={m['datetime_start']}
                end={m['datetime_end']}
                location={m['location']}
                subject={m['subject']}
            />)
    }
    return (
        <div>
            <h2>
                List meetings
            </h2>
            <button onClick={(e) => {
                e.preventDefault()
                refresh()
            }}>
                Refresh
            </button>
            {items}
        </div>
    )
}

export default MeetingList
