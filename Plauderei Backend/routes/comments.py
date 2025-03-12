from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database.database import getDB
from database.models import Comment

class CommentBase(BaseModel):
    content: str
    user_uuid: str
    username: str
    parent_id: Optional[int]=None

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    replies: List['CommentResponse']=[]

    class Config:
        from_attributes=True

router=APIRouter()

@router.post("/comments/", response_model=CommentResponse)
def add_comment(comment: CommentCreate, db:Session=Depends(getDB)):
    new_comment=Comment(
        content=comment.content,
        user_uuid=comment.user_uuid,
        username=comment.username,
        parent_id=comment.parent_id #do not have for comment, have for reply
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.get("/comments/{comment_id}", response_model=CommentResponse)
def get_comment(comment_id: int, db:Session=Depends(getDB)):
    comment=db.query(Comment).filter(Comment.id==comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.get("/comments/user/{user_uuid}", response_model=List[CommentResponse])
def get_user_comments(user_uuid: str, db: Session = Depends(getDB)):
    comments = db.query(Comment).filter(Comment.user_uuid == user_uuid, Comment.parent_id == None).all()
    return comments

@router.get("/comments/user/{user_uuid}/replies", response_model=List[CommentResponse])
def get_user_replies(user_uuid: str, db: Session = Depends(getDB)):
    replies = db.query(Comment).filter(Comment.user_uuid == user_uuid, Comment.parent_id != None).all()
    return replies

@router.get("/comments/random/", response_model=List[CommentResponse])
def get_random_comments(db:Session=Depends(getDB)):
    total_comments=db.query(Comment).filter(Comment.parent_id==None).count()
    if total_comments<5:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient comments. ONly {total_comments} comments availible."
        )
    
    random_comments=(
        db.query(Comment)
        .filter(Comment.parent_id==None)
        .order_by(func.random())
        .limit(5)
        .all()
    )

    for comment in random_comments:
        comment.replies=(
            db.query(Comment)
            .filter(Comment.parent_id==comment.id)
            .all()
        )

    return random_comments

@router.delete("/comments/")
def delete_all_comments(db: Session = Depends(getDB)):
    db.query(Comment).delete()
    db.commit()
    return {"message": "All comments deleted"}

@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(getDB)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return {"message": f"Comment {comment_id} deleted"}
