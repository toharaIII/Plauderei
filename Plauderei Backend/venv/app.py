from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

app=Flask(__name__)
CORS(app) #might want to see if this is a security issue once we get to production

dbConfig={ #this signs into the local mySQL server and opens the plauderei_db database
    'user':'root',
    'password':'Patriot523!',
    'host':'localhost',
    'database':'plauderei_db'
}

def getDBConnection():
    return mysql.connector.connect(**dbConfig) #creates a new database connection object, connected to plauderei_db
                                                # ** is the unpacking operation which when used in a function allows you to pass in each dict key value pair without writing them out
@app.route('/')
def index():
    return 'welcome to user management API :D'

"""
fetchs all columns for a given user except for passowrd for security
"""
@app.route('/data/<int:userID>', methods=['GET']) 
def getUser(userID):
    conn=getDBConnection()
    cursor=conn.cursor(dictionary=True) #dictionary=True means that the output from mysql is returned as a dictionary instead of a tuple
    jsonFields=['friendsList', 'submittedQuestions', 'pinnedAnswers']

    try:
        cursor.execute('SELECT username, name, bio, friendsList, pinnedAnswers, dateJoined, badges, answerTotal, responsesRemaining, dailyAnswer, submittedQuestions FROM users WHERE userID=%s', (userID,))
        user=cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            date_joined=datetime.strptime(str(user['dateJoined']), '%Y-%m-%d %H:%M:%S')
            user['dateJoined']=date_joined.strftime('%B %Y')

            for field in jsonFields:
                if isinstance(user[field], str):
                    try:
                        user[field] = json.loads(user[field])
                    except json.JSONDecodeError:
                        return jsonify({"error": f"Failed to parse {field}"}), 500

            return jsonify(user)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

"""
fills all required columns (userID, username, password and dateJoined) for a new row in users
"""
@app.route('/users', methods=['POST'])
def createUser():
    data=request.json
    requiredFields=['username', 'password']

    if not all(field in data for field in requiredFields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        now = datetime.now()
        date_joined = now.strftime('%Y-%m-%d %H:%M:%S')
    except ValueError as e:
        return jsonify({"error": e}), 400

    conn=getDBConnection()
    cursor=conn.cursor()
    query='''INSERT INTO users (username, password, dateJoined) VALUES (%s, %s, %s)'''
    values=(data['username'], data['password'], date_joined)
    
    try:
        cursor.execute(query, values)
        conn.commit()
        newID=cursor.lastrowid
        conn.close()
        return jsonify({"userID": newID, "message": "User created successfully"}), 201
    
    except mysql.connector.IntegrityError:
        conn.close()
        return jsonify({"error": "Username already exists"}), 409

"""
searches for user and makes sure that if the user is found the password is also the same
"""
@app.route('/login', methods=['POST']) #read that post is better for security
def login():
    data=request.json
    if 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing username or password"}), 400

    username=data['username']
    password=data['password']

    conn=getDBConnection()
    cursor=conn.cursor(dictionary=True)
    
    try:
        query="SELECT * FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        user=cursor.fetchone()

        if user and user['password'] == password:  # In production, use password hashing!
            return jsonify({"message": "Login successful", "userID": user['userID']}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"error": "An error occurred while logging in"}), 500

    finally:
        cursor.close()
        conn.close()

"""
Searching the database for a given user
"""
@app.route('/users/search', methods=['POST'])
def searchUser():
    data=request.json
    if 'username' not in data:
        return jsonify({"error": "Missing username"}), 400
    username=data['username']
    print(type(username))
    print(username)

    conn=getDBConnection()
    cursor=conn.cursor(dictionary=True)
    try:
        query="SELECT * FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        user=cursor.fetchone()
        if user:
            return jsonify({"message": "User found", "userID": user['userID']}), 200
        else:
            return jsonify({"error": "Invalid username"}), 401

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"success": False, "error": "An error occurred while searching for this user"}), 500

    finally:
        cursor.close()
        conn.close()

"""
update function that lets the data json contain as few or as many columns 
to be updated as needed for the user associated with the userID passed in through the url
this is the call you make if you want to add a friend to the userID's friendslist but not to remove
"""
@app.route('/users/<int:userID>', methods=['PATCH'])
def updateUserColumns(userID):
    data=request.json
    allowedColumns=['name', 'password', 'bio', 'friendsList', 'submittedQuestions', 'pinnedAnswers', 'dateJoined', 'dailyAnswer', 'todaysAnswer', 'answerTotal', 'responsesRemaining', 'badges']
    jsonColumns=['friendsList', 'submittedQuestions', 'pinnedAnswers'] #columns with json datatype, need to handle separately
    updateColumns=[col for col in data.keys() if col in allowedColumns]

    if not updateColumns:
        return jsonify({"error": "No valid columns to update"}), 400

    conn=getDBConnection()
    cursor=conn.cursor()
    cursor.execute('SELECT * FROM users WHERE userID = %s', (userID,))
    current_data=cursor.fetchone()

    if current_data:
        column_names=[i[0] for i in cursor.description]

        for col in jsonColumns:
            if col in data:
                col_index=column_names.index(col)

                existing_data=json.loads(current_data[col_index]) if current_data[col_index] else []
                new_data=data.get(col, [])
                updated_data=existing_data + new_data
                data[col]=updated_data

    setClauses=[]
    values=[]

    for col in updateColumns:
        value=data[col]
        if col in jsonColumns:
            value=json.dumps(value)
            setClauses.append(f"{col} = CAST(%s AS JSON)")
        else:
            setClauses.append(f"{col} = %s")
        values.append(value)

    setClause=', '.join(setClauses)
    query=f"UPDATE users SET {setClause} WHERE userID = %s"
    values.append(userID)

    try:
        cursor.execute(query, tuple(values))
        conn.commit()
        affectedRows = cursor.rowcount
        conn.close()

        if affectedRows:
            return jsonify({"message": "User columns updated successfully"}), 200
        return jsonify({"error": "User not found"}), 404
    except mysql.connector.Error as err:
        conn.close()
        return jsonify({"error": str(err)}), 500

"""
since removing a friend has a very specific sql command set up
it didnt seem worth it to try and tie it in with the other command
this removes the friend stored in friendToRemove from the friendslist
of the url passed in userID
"""
@app.route('/users/<int:userID>/removeFriend', methods=['PATCH'])
def removeFriend(userID):
    data=request.json
    friendToRemove=data['friend']

    if not friendToRemove:
        return jsonify({"error": "No friend specified to remove"}), 400
    
    conn=getDBConnection()
    cursor=conn.cursor()
    query="""
        UPDATE users
        SET friendsList = JSON_REMOVE(friendsList, 
            JSON_UNQUOTE(JSON_SEARCH(friendsList, 'one', %s)))
        WHERE userID = %s
    """
    cursor.execute(query, (friendToRemove, userID))
    
    conn.commit()
    affectedRows = cursor.rowcount
    conn.close()

    if affectedRows:
        return jsonify({"message": "Friend removed successfully"}), 200
    return jsonify({"error": "User not found or friend not found"}), 404


"""
deletes the user that is associated with the userID passed in via the url
"""
@app.route('/data/<int:userID>', methods=['DELETE'])
def deleteUser(userID):
    conn=getDBConnection()
    cursor=conn.cursor()

    try:
        cursor.execute('DELETE FROM users WHERE userID=%s', (userID,))
        conn.commit()

        if cursor.rowcount>0:
            return jsonify({"message":"User deleted successfully"}), 200
        else:
            return jsonify({"error":"User not found"}), 404
    except mysql.connector.Error as err:
        return jsonify({"error":str(err)}), 500
    finally:
        cursor.close()
        conn.close()





def resetSubmissions():
    if datetime.now().strftime('%H:%M') == '00:00':
        conn = getDBConnection()
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT * FROM questionqueue ORDER BY id ASC LIMIT 1;")
            first_row = cursor.fetchone()

            if first_row:
                question_id = first_row[0]  # Assuming 'id' is in the first column
                cursor.execute("DELETE FROM questionqueue WHERE id = %s;", (question_id,))
                print(f"Deleted questionqueue row with id: {question_id}")
            else:
                print("No rows in questionqueue to delete.")

            cursor.execute("TRUNCATE TABLE submissions;")
            cursor.execute("INSERT INTO submissions (ID, userID, submissions, parentID) VALUES (1, 1, '', NULL);")
            
            conn.commit()
            print("submissions table reset!")
        except Exception as e:
            print(f"Error during reset: {e}")
        finally:
            cursor.close()
            conn.close()

def runScheduler():
    scheduler=BackgroundScheduler()
    scheduler.add_job(func=resetSubmissions, trigger='cron', hour=0, minute=0)
    scheduler.start()







"""
gets the question for today
"""
@app.route('/todaysQuestion', methods=['GET'])
def getTodaysQuestion():
    conn=getDBConnection()
    cursor=conn.cursor() 
    query="""SELECT * FROM todaysquestion;"""

    try:
        cursor.execute(query)
        answer=cursor.fetchone()
        if answer:
            return jsonify(answer), 200
        else:
            return jsonify({"error": "no questions for today BIG PROBLEM"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

"""
updates the question for tomorrow
"""
@app.route('/todaysQuestion', methods=['PATCH'])
def updateTodaysQuestion():
    data=request.json
    question=data['question']
    if not question:
        return jsonify({"error": "No question in message sent"}), 400

    conn=getDBConnection()
    cursor=conn.cursor()
    query="""UPDATE todaysquestion SET question = %s"""

    try:
        cursor.execute(query, (question,))
        conn.commit()
        return jsonify({"message": "question successfully updated"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()






"""
this function allows a user to submit either an answer or response to another answer
"""
@app.route('/submissions/<int:userID>', methods=['POST'])
def submitAnswerorResponse(userID):
    data=request.json
    allowedColumns=['submission','parentID','userName']
    updateColumns=[col for col in data.keys() if col in allowedColumns]

    if not updateColumns:
        return jsonify({"error": "No valid columns to update"}), 400
    
    submission=data['submission']
    parentID=data['parentID']
    username=data['userName']

    conn=getDBConnection()
    cursor=conn.cursor()
    query="""
        INSERT INTO submissions (userID, submission, parentID, userName)
        VALUES (%s, %s, %s, %s)
    """

    try:
        cursor.execute(query, (userID, submission, parentID, username))
        conn.commit()
        return jsonify({"message": "submission successfully added"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

"""
this function will get and return the ANSWER of a specific user, assuming one exists, if not it also responds telling you that
"""
@app.route('/submissions/<int:userID>', methods=['GET'])
def getSpecificAnswer(userID):
    conn=getDBConnection()
    cursor=conn.cursor(dictionary=True) 
    query="""SELECT * FROM submissions WHERE userID = %s AND parentID = 1 LIMIT 1"""

    try:
        cursor.execute(query, (userID,))
        answer=cursor.fetchone()
        if answer:
            return jsonify(answer), 200
        else:
            return jsonify({"error": "no answer found for that userID"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

"""
this function gets 10 random answers, this is built for the home page for both signed in and not signed in
for when someone clicks on the question
"""
@app.route('/submissions', methods=['GET'])
def getTenAnswers():
    conn=getDBConnection()
    cursor=conn.cursor() 
    query="""SELECT * FROM submissions WHERE parentID = 1 ORDER BY RAND() LIMIT 10;"""

    try:
        cursor.execute(query)
        answer=cursor.fetchall()
        if answer:
            return jsonify(answer), 200
        else:
            return jsonify({"error": "no questions submitted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/submissions/<int:parentID>', methods=['GET'])
def getReplys(parentID):
    conn=getDBConnection()
    cursor=conn.cursor()
    query="""SELECT * FROM submissions WHERE parentID = %s"""

    try:
        cursor.execute(query, (parentID,))
        replys=cursor.fetchall()
        if replys:
            replysList=[dict(row) for row in replys]
            return jsonify(replysList), 200
        else:
            return jsonify({"error": "no replys for this answer"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()




"""
this function queries the mysql server to see if a userID passed in via json corresponds to that of any of the admins userID's this will be used to give admins access to the admin page via their menu on the site
"""
@app.route('/admin/<int:userID>', methods=['GET'])
def checkAdmin(userID):
    conn=getDBConnection()
    cursor=conn.cursor(dictionary=True, buffered=True)
    query='''SELECT * FROM admin WHERE admin = %s'''

    try:
        cursor.execute(query, (userID,))
        adminID=cursor.fetchone()
        if adminID:
            return jsonify({"message": "admin found"}), 200
        else:
            return jsonify({"error": "Username not Admin or invalid username"}), 401
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

"""
this funciton queries the mysql server to add a userID to the admin list meaning that will be granted access to the admin page(s)
"""
@app.route('/admin', methods=['PATCH'])
def addAdmin():
    data=request.json
    userID=data['userID']
    if not userID:
        return jsonify({"error": "No userID sent in message"}), 400

    conn=getDBConnection()
    cursor=conn.cursor()
    query="""INSERT INTO admin (admin) VALUES (%s)"""

    try:
        cursor.execute(query, (userID,))
        conn.commit()
        return jsonify({"message": "User now made admin"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

"""
this function queries the mysql server to remove a userID that is presumed to be admin meaning that they will no longer be granted access to the admin page(s)
"""
@app.route('/admin', methods=['DELETE'])
def removeAdmin():
    data=request.json
    userID=data['userID']
    if not userID:
        return jsonify({"error": "No userID sent in message"}), 400

    conn=getDBConnection()
    cursor=conn.cursor()
    query="""DELETE FROM admin WHERE admin=%s"""

    try:
        cursor.execute(query, (userID,))
        conn.commit()
        return jsonify({"message": "User no longer admin"}), 201
    except mysql.connector.Error as e:
        return jsonify({"error":str(e)}), 500
    finally:
        cursor.close()
        conn.close()



"""
this function returns all submitted questions from all users which have submitted a question for consideration from daily question
"""
@app.route('/questionQueue', methods=['GET'])
def getAllSubmittedQuestions():
    conn=getDBConnection()
    cursor=conn.cursor()
    query="""SELECT userID, userName, submittedQuestions FROM users WHERE JSON_LENGTH(submittedQuestions) > 0;"""

    try:
        cursor.execute(query)
        answer=cursor.fetchall()
        if answer:
            return jsonify(answer), 200
        else:
            return jsonify({"error": "unable to collect questions"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/questionQueueSubmissions', methods=['GET'])
def getQueue():
    conn=getDBConnection()
    cursor=conn.cursor()
    query="SELECT * FROM questionqueue"

    try:
        cursor.execute(query)
        answer=cursor.fetchall()
        if answer:
            return jsonify(answer), 200
        else:
                return jsonify({"error": "no queue currently"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

"""
this function adds a question to the queue by adding it to the mysql question queue table, this is used on teh admin page or for the admins to directly add a question not submitted by a given user
"""
@app.route('/questionQueue', methods=['PATCH'])
def addToQuestionQueue():
    data=request.json
    question=data['question']
    userID=data['userID']
    if not question:
        return jsonify({"error": "no question in message"})

    conn=getDBConnection()
    cursor=conn.cursor()
    query="""INSERT INTO questionqueue (question, userID) VALUES (%s, %s)"""

    try:
        cursor.execute(query, (question, userID,))
        conn.commit()
        return jsonify({"message": "question added to queue"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

"""
this function removes a question from the question row in the questionqueue table for the mysql server
"""
@app.route('/questionQueue', methods=['DELETE'])
def removeQuestion():
    data=request.json
    question=data['question']
    if not question:
        return jsonify({"error": "No question in message"}), 400

    conn=getDBConnection()
    cursor=conn.cursor()
    query="""DELETE FROM questionqueue WHERE question=%s"""

    try:
        cursor.execute(query, (question,))
        conn.commit()
        return jsonify({"message": "question no longer in queue"}), 200
    except mysql.connector.Error as e:
        return jsonify({"error":str(e)}), 500
    finally:
        cursor.close()
        conn.close()








if __name__=='__main__':
     runScheduler()
     app.run(debug=True)