from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json
from datetime import datetime

app=Flask(__name__) #creates a flask object
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
    cursor.execute('SELECT username, name, bio, friendsList, pinnedAnswers, dateJoined, badges FROM users WHERE userID=%s', (userID,))
    user=cursor.fetchone()
    conn.close()

    date_joined=datetime.strptime(str(user['dateJoined']), '%Y-%m-%d %H:%M:%S')
    user['dateJoined']=date_joined.strftime('%B %Y')

    if user:
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404

"""
fills all required columns (userID, username, password and dateJoined) for a new row in users
"""
@app.route('/users', methods=['POST'])
def createUser():
    data=request.json
    requiredFields=['username', 'password']

    if not all(field in data for field in requiredFields):
        return jsonify({"success": False, "error": "Missing required fields"}), 400
    
    try:
        now = datetime.now()
        date_joined = now.strftime('%Y-%m-%d %H:%M:%S')
    except ValueError as e:
        return jsonify({"success": False, "error": "Invalid date format"}), 400 #success key lets js know to go to the signin home or not

    conn=getDBConnection()
    cursor=conn.cursor()
    query='''INSERT INTO users (username, password, dateJoined) VALUES (%s, %s, %s)'''
    values=(data['username'], data['password'], date_joined)
    
    try:
        cursor.execute(query, values)
        conn.commit()
        newID=cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "userID": newID, "message": "User created successfully"}), 201
    
    except mysql.connector.IntegrityError:
        conn.close()
        return jsonify({"success": False, "error": "Username already exists"}), 409

"""
searches for user and makes sure that if the user is found the password is also the same
"""
@app.route('/login', methods=['POST']) #read that post is better for security
def login():
    data=request.json
    if 'username' not in data or 'password' not in data:
        return jsonify({"success": False, "error": "Missing username or password"}), 400

    username=data['username']
    password=data['password']

    conn=getDBConnection()
    cursor=conn.cursor(dictionary=True)
    
    try:
        # Fetch the user from the database
        query="SELECT * FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        user=cursor.fetchone()

        if user and user['password'] == password:  # In production, use password hashing!
            return jsonify({"success": True, "message": "Login successful", "userID": user['userID']}), 200
        else:
            return jsonify({"success": False, "error": "Invalid username or password"}), 401

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"success": False, "error": "An error occurred while logging in"}), 500

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
        return jsonify({"success": False, "error": "Missing username"}), 400
    username=data['username']

    conn=getDBConnection()
    cursor=conn.cursor(dictionary=True)
    try:
        # Fetch the user from the database
        query="SELECT * FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        user=cursor.fetchone()
        if user:
            return jsonify({"success": True, "message": "User found", "userID": user['userID']}), 200
        else:
            return jsonify({"success": False, "error": "Invalid username"}), 401

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"success": False, "error": "An error occurred while searching for this user"}), 500

    finally:
        cursor.close()
        conn.close()

"""
update function that lets the data json contain as few or as many columns to be updated as needed for the user associated with the userID passed in through the url
"""
@app.route('/users/<int:userID>', methods=['PATCH'])
def updateUserColumns(userID):
    data=request.json
    allowedColumns=['name', 'password', 'bio', 'friendsList', 'questions', 'pinnedAnswers', 'dateJoined']
    jsonColumns=['friendsList', 'questions', 'pinnedAnswers'] #columns with json datatype, need to handle separately
    updateColumns=[col for col in data.keys() if col in allowedColumns]

    if not updateColumns:
        return jsonify({"error": "No valid columns to update"}), 400
    
    conn=getDBConnection()
    cursor=conn.cursor()

    setClauses=[]
    values=[]

    for col in updateColumns:
        value=data[col]
        if col in jsonColumns:
            value=json.dumps(value)  # Convert list to JSON string
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
        affectedRows=cursor.rowcount
        conn.close()

        if affectedRows:
            return jsonify({"message": "User columns updated successfully"}), 200
        return jsonify({"error": "User not found"}), 404
    except mysql.connector.Error as err:
        conn.close()
        return jsonify({"error": str(err)}), 500

"""
since removing a friend has a very specific sql command set up it didnt seem worth it to try and tie it in with the other command
"""
@app.route('/users/<int:userID>/removeFriend', methods=['PATCH'])
def removeFriend(userID):
    data=request.json
    friendToRemove=data.get('friend')

    if not friendToRemove:
        return jsonify({"error": "No friend specified to remove"}), 400
    
    conn=getDBConnection()
    cursor=conn.cursor()

    # SQL query to remove the friend from the JSON array in MySQL
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
        conn.close()

if __name__=='__main__':
    app.run(debug=True)