import random
import string
from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, BaseSettings, EmailStr
from models import User as UserInDB, Meeting as MeetingInDB, Participant, Interest, create_db, bind_engine, get_session
from sqlalchemy.orm import Session

ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class Settings(BaseSettings):
    secret_key: str
    port: int
    app_origin: str

    class Config:
        env_file = '.env'


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginUser(BaseModel):
    email: EmailStr
    name: Optional[str]
    password: str

    class Config:
        schema_extra = {
            'example': {
                'email': 'me@mail.com',
                'name': 'John Smith',
                'password': 'secret',
            }
        }


class User(BaseModel):
    email: EmailStr
    name: Optional[str]
    points: Optional[int]
    interests: List[str]

    class Config:
        schema_extra = {
            'example': {
                'email': 'me@mail.com',
                'name': 'John Smith',
                'points': 24,
                'interests': ['math', 'computers'],
            }
        }


class Meeting(BaseModel):
    id: str
    datetime_start: datetime
    datetime_end: datetime
    location: str
    subject: str

    class Config:
        schema_extra = {
            'example': {
                'id': 'JHJ454',
                'datetime_start': '2021-05-16 00:18:31.568334',
                'datetime_end': '2021-05-16 00:20:31.568334',
                'location': 'Spain',
                'subject': 'math',
            }
        }


settings = Settings()
create_db('sqlite:///db.sqlite')
bind_engine('sqlite:///db.sqlite')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()

origins = [
    settings.app_origin,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str):
    return pwd_context.hash(password)


def get_user_from_db(email: str) -> (UserInDB, Session):
    session = get_session()
    user = session.query(UserInDB).filter_by(email=email).first()
    return user, session


def authenticate_user(email: str, password: str) -> (UserInDB, Session):
    user, session = get_user_from_db(email)
    if not user:
        return False, None
    if not verify_password(password, user.hashed_password):
        return False, None
    return user, session


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> (UserInDB, Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user, session = get_user_from_db(token_data.email)
    if user is None:
        raise credentials_exception
    return user, session


@app.post('/token', response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user, session = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={'sub': user.email}, expires_delta=access_token_expires
    )
    return {'access_token': access_token, 'token_type': 'bearer'}


def make_user_from_db(user_in_db: UserInDB) -> User:
    interests = [interest.subject for interest in user_in_db.interests]
    user = User(
        email=user_in_db.email,
        name=user_in_db.name,
        points=user_in_db.points,
        interests=interests,
    )
    return user


def make_meeting_from_db(meeting_in_db: MeetingInDB) -> Meeting:
    meeting = Meeting(
        id=meeting_in_db.id,
        datetime_start=meeting_in_db.datetime_start,
        datetime_end=meeting_in_db.datetime_end,
        location=meeting_in_db.location,
        subject=meeting_in_db.subject,
    )
    return meeting


@app.post('/user', response_model=User)
def add_user(user: LoginUser):
    session = get_session()
    new_user = UserInDB(email=user.email, name=user.name, hashed_password=get_password_hash(user.password))
    session.add(new_user)
    session.commit()

    return make_user_from_db(new_user)


@app.get('/user', response_model=User)
def get_user(user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    user: UserInDB = user_session_tuple[0]

    return make_user_from_db(user)


@app.post('/user/interests', response_model=User)
def add_interests(interests: List[str], user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    user: UserInDB = user_session_tuple[0]
    session: Session = user_session_tuple[1]

    prev_interests = [interest.subject for interest in user.interests]
    user.interests += [Interest(user=user, subject=i) for i in interests if i not in prev_interests]
    session.commit()

    return make_user_from_db(user)


def generate_meeting_id(length: int) -> str:
    # TODO: this may eventually result in id collisions
    source = string.ascii_letters + string.digits
    return ''.join((random.choice(source) for i in range(length)))


@app.get('/meetings', response_model=List[Meeting])
def get_meetings(user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    session: Session = user_session_tuple[1]

    meetings = session.query(MeetingInDB).filter(MeetingInDB.datetime_end > datetime.now()).all()

    return [make_meeting_from_db(m) for m in meetings]


@app.post('/meetings', response_model=Meeting)
def create_meeting(hours: int, location: str, subject: str,
                   user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    user: UserInDB = user_session_tuple[0]
    session: Session = user_session_tuple[1]

    last_joined_meeting = max([p.datetime_join for p in user.participants], default=None)

    # Avoid people joining two meetings in the same hour
    if last_joined_meeting and last_joined_meeting > datetime.now() - timedelta(hours=1):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Don\'t hop meetings so fast, dude',
        )

    meeting_id = generate_meeting_id(8)
    now = datetime.now()
    later = now + timedelta(hours=hours)
    new_meeting = MeetingInDB(
        id=meeting_id,
        datetime_start=now,
        datetime_end=later,
        location=location,
        subject=subject,
    )
    new_participant = Participant(user=user, meeting=new_meeting, datetime_join=now)

    session.add(new_participant)
    session.commit()

    return make_meeting_from_db(new_meeting)


@app.post('/meetings/{meeting_id}/join', response_model=Meeting)
def join_meeting(meeting_id: str, user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    user: UserInDB = user_session_tuple[0]
    session: Session = user_session_tuple[1]

    meeting = session.query(MeetingInDB).filter_by(id=meeting_id).first()
    number_participants = len(meeting.participants)

    # Limit the capacity of a meeting to six
    if number_participants + 1 > 6:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='The meeting is full.',
        )

    last_joined_meeting = max([p.datetime_join for p in user.participants], default=None)

    # Avoid people joining two meetings in the same hour
    if last_joined_meeting and last_joined_meeting > datetime.now() - timedelta(hours=1):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Don\'t hop meetings so fast, dude',
        )

    new_participant = Participant(user=user, meeting=meeting, datetime_join=datetime.now())

    session.add(new_participant)
    session.commit()

    return make_meeting_from_db(meeting)


@app.get('/meetings/{meeting_id}/participants', response_model=List[User])
def get_meeting_participants(meeting_id: str, user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    user: UserInDB = user_session_tuple[0]
    session: Session = user_session_tuple[1]

    meeting = session.query(MeetingInDB).filter_by(id=meeting_id).first()

    people = [make_user_from_db(p.user) for p in meeting.participants]

    return people


def get_known_people(user: UserInDB) -> List[UserInDB]:
    people = []
    for user_participation in user.participants:
        for other_participant in user_participation.meeting.participants:
            friend = other_participant.user
            # Avoid counting the user as a friend
            if friend != user:
                people.append(friend)

    people = list(set(people))
    return people


def get_similar_people(user: UserInDB, session: Session) -> List[UserInDB]:
    people = []
    for user_interest in user.interests:
        subject = user_interest.subject
        similar_people = [i.user for i in session.query(Interest).filter_by(subject=subject).all() if i.user != user]
        people += similar_people

    people = list(set(people))
    return people


@app.get('/recommendations', response_model=List[User])
def get_recommended_friends(user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    user: UserInDB = user_session_tuple[0]
    session: Session = user_session_tuple[1]

    known_people = get_known_people(user)
    similar_people = get_similar_people(user, session)

    return [make_user_from_db(p) for p in similar_people if p not in known_people]


@app.post('/points', response_model=User)
def redeem_points(user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    user: UserInDB = user_session_tuple[0]
    session: Session = user_session_tuple[1]

    # Allow to redeem only once per week
    if not user.last_time_redeem_points or user.last_time_redeem_points + timedelta(days=7) <= datetime.now():
        friends = []
        for user_participation in user.participants:
            # Check meetings that took place within last month
            if user_participation.meeting.datetime >= datetime.now() - timedelta(days=31):
                for other_participant in user_participation.meeting.participants:
                    friend = other_participant.user
                    # Avoid counting the user as a friend
                    if friend != user:
                        friends.append(friend)

        num_friends = len(set(friends))
        user.points += num_friends
        user.last_time_redeem_points = datetime.now()
        session.commit()

    return make_user_from_db(user)


@app.post('/buy/pizza', response_model=str)
def buy_pizza(user_session_tuple: (UserInDB, Session) = Depends(get_current_user)):
    user: UserInDB = user_session_tuple[0]
    session: Session = user_session_tuple[1]
    if user.points < 10:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail='Sorry, friend. You do not have enough points for pizza',
        )
    user.points -= 10
    session.commit()
    return 'Enjoy your pizza!'


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('app:app', host='0.0.0.0', port=settings.port, log_level='info')
