from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database.database import getDB
from database.models import dailyQuestionQueue

class QuestionCreate(BaseModel):
    question: str
    position: int

router=APIRouter()

@router.get("/questions/", response_model=List[QuestionCreate])
def get_all_questions(db: Session=Depends(getDB)):
    return db.query(dailyQuestionQueue).all()

@router.post("/questions/")
def add_question(data: QuestionCreate, db:Session=Depends(getDB)):
    print(f"Received data: {data}")
    try:
        new_question=dailyQuestionQueue(question=data.question, position=data.position)
        db.add(new_question)
        db.commit()
        db.refresh(new_question)
        return new_question
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/questions/")
def delete_question(question_id: int, db: Session=Depends(getDB)):
    question=db.query(dailyQuestionQueue).filter(dailyQuestionQueue.question_id==question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return{"message": "Question deleted successfully"}