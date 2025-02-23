from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
import uuid
from database.database import getDB
from database.models import User

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserUpdate(BaseModel):
    bio: Optional[str]=None
    PinnedAnswer: Optional[Dict]=None
    curAnswer: Optional[str]=None

class UserResponse(BaseModel):
    user_uuid: str
    email: EmailStr
    username: str
    bio: Optional[str]
    stickerCount: int
    friendsList: Dict
    curAnswer: Optional[str]
    answerCount: int
    replyCount: int
    pinnedAnswer: Dict

    class Config:
        from_attributes=True

router=APIRouter()

@router.post("/user/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session=Depends(getDB)):
    existing_user = db.query(User).filter(User.email==user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        user_uuid=str(uuid.uuid4()),
        email=user.email,
        password=user.password,  #Hash this in production!!!!!!!!!!
        username=user.username,
        bio=None,
        stickerCount=0,
        friendsList={},
        curAnswer=None,
        answerCount=1,
        replyCount=3,
        pinnedAnswer={}
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

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
def add_friend(user_uuid: str, friend_username: str, friend_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if friend_uuid in user.friendsList:
        raise HTTPException(status_code=400, detail="Friend already added")

    user.friendsList[friend_uuid] = friend_username
    db.commit()
    return {"message": "Friend added successfully"}

@router.post("/user/{user_uuid}/remove_friend")
def remove_friend(user_uuid: str, friend_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if friend_uuid not in user.friendsList:
        raise HTTPException(status_code=400, detail="Friend not found")

    del user.friendsList[friend_uuid]
    db.commit()
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
def update_cur_answer(user_uuid: str, new_answer: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.curAnswer=new_answer
    db.commit()
    return {"message": "Current answer updated"}

@router.post("/user/{user_uuid}/answercount/increment")
def increment_answer_count(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.answerCount+=1
    db.commit()
    return {"message": "Answer count incremented"}

@router.post("/user/{user_uuid}/answercount/decrement")
def decrement_answer_count(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.answerCount>0:
        user.answerCount-=1

    db.commit()
    return {"message": "Answer count decremented"}

@router.post("/user/{user_uuid}/replycount/decrement")
def decrement_reply_count(user_uuid: str, db: Session=Depends(getDB)):
    user=db.query(User).filter(User.user_uuid==user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.replyCount-=1
    if user.replyCount<=0:
        user.replyCount=3

    db.commit()
    return {"message": "Reply count updated"}