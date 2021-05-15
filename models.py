from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, ForeignKey, String, DateTime, Integer
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()
Session = sessionmaker()


class User(Base):
    __tablename__ = 'users'

    email = Column(String, primary_key=True)
    name = Column(String)
    hashed_password = Column(String)
    points = Column(Integer, default=0)
    last_time_redeem_points = Column(DateTime)


class Meeting(Base):
    __tablename__ = 'meetings'

    id = Column(String, primary_key=True)
    datetime = Column(DateTime)


class Participant(Base):
    __tablename__ = 'participants'

    user_id = Column(String, ForeignKey('users.email'), primary_key=True)
    meeting_id = Column(String, ForeignKey('meetings.id'), primary_key=True)

    user = relationship('User', back_populates='participants')
    meeting = relationship('Meeting', back_populates='participants')


class Interest(Base):
    __tablename__ = 'interests'

    user_id = Column(String, ForeignKey('users.email'), primary_key=True)
    subject = Column(String, primary_key=True)

    user = relationship('User', back_populates='interests')


User.participants = relationship('Participant')
User.interests = relationship('Interest')
Meeting.participants = relationship('Participant')


def create_db(database: str) -> None:
    engine = create_engine(database)
    Base.metadata.create_all(engine)


def bind_engine(database: str) -> None:
    engine = create_engine(database)
    Session.configure(bind=engine)


def get_session() -> Session:
    return Session()
