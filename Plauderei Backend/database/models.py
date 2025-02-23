from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import relationship
from .database import base

class User(base):
    __tablename__="users"

    user_uuid=Column(String(36), primary_key=True, unique=True, nullable=False)
    email=Column(String(255), unique=True, nullable=False)
    password=Column(String(255), nullable=False)
    username=Column(String(100), nullable=False)
    bio=Column(Text)
    stickerCount=Column(Integer, default=0)
    friendsList=Column(JSON)
    curAnswer=Column(Text, nullable=True)
    answerCount=Column(Integer, default=1)
    replyCount=Column(Integer, default=3)
    pinnedAnswer=Column(JSON)

    comments=relationship("Comment", back_populates="users")
    submitted_questions=relationship("submittedQuestion", back_populates="user")

class Comment(base):
    __tablename__="comments"

    commentId=Column(Integer, primary_key=True, autoincrement=True)
    content=Column(Text, nullable=False)
    user_uuid=Column(String(36), ForeignKey("users.user_uuid"), nullable=False)
    parent_id=Column(Integer, ForeignKey("comments.commentId"), nullable=True)
    timestamp=Column(DateTime, server_default=func.now())

    users=relationship("User", back_populates="comments")

class dailyQuestionQueue(base):
    __tablename__="daily_questions_queue"

    question_id=Column(Integer, primary_key=True, autoincrement=True)
    question=Column(Text, nullable=False)
    position=Column(Integer, nullable=False, unique=True)

class submittedQuestion(base):
    __tablename__="submitted_questions"

    question_id=Column(Integer, primary_key=True, autoincrement=True)
    question=Column(Text, nullable=False)
    user_uuid=Column(String(36), ForeignKey("users.user_uuid"), nullable=False)
    time_submitted=Column(DateTime, server_default=func.now())

    user=relationship("User", back_populates="submitted_questions")