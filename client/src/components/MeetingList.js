import React, {useState} from "react";
import MeetingItem from "./MeetingItem";

function MeetingList() {
    return (
        <div>
            <h2>
                List meetings
            </h2>
            <MeetingItem/>
            <MeetingItem/>
        </div>
    )
}

export default MeetingList
