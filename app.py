import random
import string
from typing import Optional
from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, BaseSettings, EmailStr
from models import User as UserInDB, Meeting, Participant, create_db, bind_engine, get_session

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

    class Config:
        schema_extra = {
            'example': {
                'email': 'me@mail.com',
                'name': 'John Smith',
                'points': 24,
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


def get_user_from_db(email: str) -> UserInDB:
    session = get_session()
    user = session.query(UserInDB).filter_by(email=email).first()
    if user:
        return user


def authenticate_user(email: str, password: str):
    user = get_user_from_db(email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
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
    user = get_user_from_db(token_data.email)
    if user is None:
        raise credentials_exception
    return user


@app.post('/token', response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
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


@app.post('/user', response_model=User)
def add_user(user: LoginUser):
    session = get_session()
    new_user = UserInDB(email=user.email, name=user.name, hashed_password=get_password_hash(user.password))
    session.add(new_user)
    session.commit()

    return User(email=user.email)


@app.get('/user', response_model=User)
async def get_user(current_user: UserInDB = Depends(get_current_user)):
    return User(email=current_user.email, name=current_user.name)


def generate_meeting_id(length: int) -> str:
    # TODO: this may eventually result in id collisions
    source = string.ascii_letters + string.digits
    return ''.join((random.choice(source) for i in range(length)))


@app.post('/meetings', response_model=str)
def create_meeting(user: UserInDB = Depends(get_current_user)):
    # TODO: fix this. user comes with a different session, so I need to merge it.
    #  Would be cleaner to use only one session
    session = get_session()

    meeting_id = generate_meeting_id(8)
    new_meeting = Meeting(id=meeting_id, datetime=datetime.now())
    new_participant = Participant(user=session.merge(user), meeting=new_meeting)

    session.add(new_participant)
    session.commit()

    return meeting_id


@app.post('/meetings/{meeting_id}/join')
def join_meeting(meeting_id: str, user: UserInDB = Depends(get_current_user)):
    # TODO: fix this too
    session = get_session()

    meeting = session.query(Meeting).filter_by(id=meeting_id).first()
    new_participant = Participant(user=session.merge(user), meeting=meeting)

    session.add(new_participant)
    session.commit()


@app.post('/points', response_model=User)
def redeem_points(user: UserInDB = Depends(get_current_user)):
    session = get_session()
    user = session.merge(user)

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

    return User(email=user.email, name=user.name, points=user.points)


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('app:app', host='0.0.0.0', port=settings.port, log_level='info')
