from fastapi import FastAPI
from routes import user, comments, dailyQuestionQueue, submittedQuestions
from database.database import base, engine

app=FastAPI()

#creating tables
base.metadata.create_all(bind=engine)
app.include_router(user.router)
app.include_router(comments.router)
app.include_router(dailyQuestionQueue.router)
app.include_router(submittedQuestions.router)


@app.get("/")
def root():
    print("FastAPI is running and receiving requests.")
    return {"message": "Hello from FastAPI!"}
