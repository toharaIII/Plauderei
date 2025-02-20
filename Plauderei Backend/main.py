from fastapi import FastAPI
from . import routes, database
from routes import user, comments
from database import models
from database.database import base, engine

app=FastAPI()

#creating tables
base.metadata.create_all(bind=engine)
app.include_router(user.router)
app.include_router(comments.router)
