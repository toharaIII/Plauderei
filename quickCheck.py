import pymysql
from sqlalchemy import create_engine


try:
    connection = pymysql.connect(
        host="localhost",
        user="root",
        password="Patriot523!",
        database="plaudereirefactor"
    )
    print("Connected to the database successfully!")

    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        print("Tables in database:", tables)

    connection.close()

except Exception as e:
    print("Error connecting to the database:", e)


dataBaseURL = "mysql+pymysql://root:Patriot523!@localhost/plaudereirefactor"

try:
    engine = create_engine(dataBaseURL)
    connection = engine.connect()
    print("Connected successfully!")
    connection.close()
except Exception as e:
    print("Connection failed:", e)