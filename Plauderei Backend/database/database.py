from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

#mysql database url
dataBaseURL="mysql+pymysql://root:Patriot523!@localhost/plaudereirefactor"
engine=create_engine(dataBaseURL)
sessionLocal=sessionmaker(autocommit=False, autoflush=False, bind=engine)
base=declarative_base()

def getDB():
    db=sessionLocal()
    try:
        yield db
    finally:
        db.close()



#for testing, not tried yet
#try:
#    engine = create_engine(dataBaseURL)
#    connection = engine.connect()
#    print("Connected successfully!")
#    connection.close()
#except Exception as e:
#    print("Connection failed:", e)
