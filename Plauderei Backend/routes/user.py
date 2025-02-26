from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
import uuid
import bcrypt
from database.database import getDB
from database.models import User

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    identifier: str
    password: str

class UserUpdate(BaseModel):
    bio: Optional[str]=None
    Pinned_answer: Optional[Dict]=None
    cur_answer: Optional[str]=None

class FriendRequest(BaseModel):
    friend_username: str
    friend_uuid: uuid.UUID

class RemoveFriendRequest(BaseModel):
    friend_uuid: uuid.UUID

class UpdateAnswerRequest(BaseModel):
    new_answer: str

class UserResponse(BaseModel):
    user_uuid: str
    email: EmailStr
    username: str
    bio: Optional[str]
    sticker_count: int
    friends_list: Dict
    cur_answer: Optional[str]
    answer_count: int
    reply_count: int
    pinned_answers: Dict

    class Config:
        from_attributes=True

router=APIRouter()

@router.post("/user/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session=Depends(getDB)):
    existing_user=db.query(User).filter(User.email==user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password=bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    new_user = User(
        user_uuid=str(uuid.uuid4()),
        email=user.email,
        password=hashed_password,
        username=user.username,
        bio=None,
        sticker_count=0,
        friends_list={},
        cur_answer=None,
        answer_count=1,
        reply_count=3,
        pinned_answers={}
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/user/login/", response_model=UserResponse)
def login_user(user: UserLogin, db: Session=Depends(getDB)):
    existing_user = db.query(User).filter(
        or_(User.email==user.identifier, User.username==user.identifier)
    ).first()

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email/username or password")
    
    if not bcrypt.checkpw(user.password.encode('utf-8'), existing_user.password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email/username or password")

    return existing_user  # FastAPI will convert this to UserResponse

@router.delete("/user/{user_uuid}")
def delete_user(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.patch("/user/{user_uuid}", response_model=UserResponse)
def update_user(user_uuid: str, user_update: UserUpdate, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

@router.post("/user/{user_uuid}/add_friend")
def add_friend(user_uuid: uuid.UUID, request: FriendRequest, db: Session = Depends(getDB)):
    user = db.query(User).filter(User.user_uuid == str(user_uuid)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.friends_list:
        user.friends_list = {}
    else:
        user.friends_list = user.friends_list.copy()

    if str(request.friend_uuid) in user.friends_list:
        raise HTTPException(status_code=400, detail="Friend already added")

    user.friends_list[str(request.friend_uuid)] = request.friend_username
    db.commit()
    db.refresh(user)

    return {"message": "Friend added successfully"}

@router.post("/user/{user_uuid}/remove_friend")
def remove_friend(user_uuid: uuid.UUID, request: RemoveFriendRequest, db: Session = Depends(getDB)):
    user = db.query(User).filter(User.user_uuid == str(user_uuid)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.friends_list:
        raise HTTPException(status_code=400, detail="No friends found")

    user.friends_list = user.friends_list.copy()

    if str(request.friend_uuid) not in user.friends_list:
        raise HTTPException(status_code=400, detail="Friend not found")

    del user.friends_list[str(request.friend_uuid)]
    db.commit()
    db.refresh(user)

    return {"message": "Friend removed successfully"}

@router.get("/user/{user_uuid}", response_model=UserResponse)
def get_user(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/user/{user_uuid}/add_sticker")
def add_sticker(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.stickerCount+=1
    db.commit()
    return {"message": "Sticker count incremented"}

@router.patch("/user/{user_uuid}/update_cur_answer")
def update_cur_answer(user_uuid: uuid.UUID, request: UpdateAnswerRequest, db: Session = Depends(getDB)):
    user = db.query(User).filter(User.user_uuid == str(user_uuid)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.cur_answer = request.new_answer
    db.commit()
    db.refresh(user)

    return {"message": "Current answer updated successfully"}

@router.post("/user/{user_uuid}/answercount/increment")
def increment_answer_count(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.answer_count+=1
    db.commit()
    return {"message": "Answer count incremented"}

@router.post("/user/{user_uuid}/answercount/decrement")
def decrement_answer_count(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.answer_count>0:
        user.answer_count-=1

    db.commit()
    return {"message": "Answer count decremented"}

@router.post("/user/{user_uuid}/replycount/decrement")
def decrement_reply_count(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.reply_count-=1
    if user.reply_count<=0:
        user.reply_count=3

    db.commit()
    return {"message": "Reply count updated"}