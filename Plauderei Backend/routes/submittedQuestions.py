from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database.database import getDB
from database.models import submittedQuestion

class SubmittedQuestionCreate(BaseModel):
    question: str
    user_uuid: str

class SubmittedQuestionResponse(BaseModel):
    question_id: int
    question: str
    user_uuid: str
    time_submitted: datetime

    class Config:
        from_attributes = True

router=APIRouter()

@router.post("/submitted/", response_model=SubmittedQuestionResponse)
def add_question(question_data: SubmittedQuestionCreate, db:Session=Depends(getDB)):
    try:
        new_question=submittedQuestion(**question_data.dict())
        db.add(new_question)
        db.commit()
        db.refresh(new_question)
        return new_question
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/submitted/", response_model=List[SubmittedQuestionResponse])
def get_all_questions(db:Session=Depends(getDB)):
    return db.query(submittedQuestion).all()

@router.get("/submitted/{user_uuid}", response_model=List[SubmittedQuestionResponse])
def get_questions_by_user(user_uuid: str, db:Session=Depends(getDB)):
    questions=db.query(submittedQuestion).filter(submittedQuestion.user_uuid==user_uuid).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this user")
    return questions

@router.get("/submitted/{start_time}", response_model=List[SubmittedQuestionResponse])
def get_questions_from_time(start_time: datetime, db:Session=Depends(getDB)):
    questions=db.query(submittedQuestion).filter(submittedQuestion.time_submitted>=start_time).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found in this time frame")
    return questions