from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database.database import getDB
from database.models import Comment

class CommentBase(BaseModel):
    content: str
    user_uuid: str
    parent_id: Optional[int]=None

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    commentId: int
    timestamp: datetime
    replies: List['CommentResponse']=[]

    class Config:
        from_attributes=True

router=APIRouter()

@router.post("/comments/", response_model=CommentResponse)
def add_comment(comment: CommentCreate, db:Session=Depends(getDB)):
    new_comment=Comment(
        content=comment.content,
        user_uuid=comment.user_uuid,
        parent_id=comment.parent_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.get("/comments/{comment_id}", response_model=CommentResponse)
def get_comment(comment_id: int, db:Session=Depends(getDB)):
    comment=db.query(Comment).filter(Comment.commentId==comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment