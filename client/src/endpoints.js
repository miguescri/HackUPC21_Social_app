import Api from "./Api";

const VERB_GET = 'GET'
const VERB_POST = 'POST'

const my_fetch = (token, endpoint, verb, searchParams, body) => (
    fetch(Api + endpoint + '?' + searchParams,
        {
            method: verb,
            mode: 'cors',
            credentials: 'include',
            headers: {'Authorization': 'Bearer ' + token},
            body: JSON.stringify(body),
        }))

export function get_user(token, setUser) {
    my_fetch(token, '/user', VERB_GET)
        .then(result => result.json())
        .then(data => setUser(data))
}

export function add_interests(token, interests, setUser) {
    my_fetch(token, '/user/interests', VERB_POST, null, interests)
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

export function redeem_points(token, setUser) {
    my_fetch(token, '/points', VERB_POST)
        .then(result => result.json())
        .then(data => setUser(data))
}

export function get_recommendations(token, setUsers) {
    my_fetch(token, '/recommendations', VERB_GET)
        .then(result => result.json())
        .then(data => setUsers(data))
}

export function buy_pizza(token, setSuccess, setError) {
    my_fetch(token, '/buy/pizza', VERB_POST)
        .then(response => {
            if (response.ok) {
                setSuccess(true)
            } else {
                setError(true)
            }
        })
}
