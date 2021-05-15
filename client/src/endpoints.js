import Api from "./Api";

const VERB_GET = 'GET'
const VERB_POST = 'POST'

const my_fetch = (token, endpoint, verb, body) => (
    fetch(Api + endpoint,
        {
            method: verb,
            mode: 'cors',
            credentials: 'include',
            headers: {'Authorization': 'Bearer ' + token},
            body: body,
        }))

export function get_user(token, setUser) {
    my_fetch(token, '/user', VERB_GET)
        .then(result => result.json())
        .then(data => setUser(data))
}

export function add_interests(token, interests, setUser) {
    my_fetch(token, '/user/interests', VERB_POST, interests)
        .then(result => result.json())
        .then(data => setUser(data))
}

export function get_meetings(token, setMeetings) {
    my_fetch(token, '/meetings', VERB_GET)
        .then(result => result.json())
        .then(data => setMeetings(data))
}

export function create_meeting(token, hours, location, subject, setMeeting) {
    let searchParams = new URLSearchParams();

    searchParams.append('hours', hours);
    searchParams.append('location', location);
    searchParams.append('subject', subject);

    my_fetch(token, '/meetings', VERB_POST, searchParams)
        .then(result => result.json())
        .then(data => setMeeting(data))
}

export function join_meeting(token, meeting_id, setMeeting) {
    my_fetch(token, '/meetings/' + meeting_id + '/join', VERB_POST)
        .then(result => result.json())
        .then(data => setMeeting(data))
}
