from flask import Flask, request, jsonify
import mysql.connector
import json

app=Flask(__name__) #creates a flask object

dbConfig={ #this signs into the local mySQL server and opens the plauderei_db database
    'user':'root',
    'password':'Patriot523!',
    'host':'localhost',
    'database':'plauderei_db'
}

def getDBConnection():
    return mysql.connector.connect(**dbConfig) #creates a new database connection object, connected to plauderei_db

@app.route('/')
def index():
    return 'welcome to user management API :D'

"""
fetchs all columns for a given user except for passowrd for security
"""
@app.route('/data/<int:userID>', methods=['GET']) 
def getUser(userID):
    conn=getDBConnection()
    cursor=conn.cursor(dictionary=True)
    cursor.execute('SELECT userID, username, name, bio, friendsList, questions, pinnedAnswers, dateJoined FROM users WHERE userID=%s', (userID,))
    user=cursor.fetchone()
    conn.close()

    if user:
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404

"""
fills all required columns (userID, username, password and dateJoined) for a new row in users
"""
@app.route('/users', methods=['POST'])
def createUser():
    data=request.json
    requiredFields=['username','password','dateJoined'] #userID autoincrements when a new row is created

    if not all(field in data for field in requiredFields): #if no key in the submitted data corresponding key name, return error
        return jsonify({"error": "Missing required fields"}), 400
    
    conn=getDBConnection()
    cursor=conn.cursor()
    query='''INSERT INTO users (username, name, password, bio, friendsList, questions, pinnedAnswers, dateJoined)
             VALUES (%s, %s, %s, %s, %s, %s, %s, %s)'''
    values=(data['username'], data.get('name'), data['password'],
            data.get('bio'), data.get('friendsList'), data.get('questions'),
            data.get('pinnedAnswers'), data['dateJoined'])
    
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
update function that lets the data json contain as few or as many columns to be updated as you want
"""
@app.route('/users/<int:userID>', methods=['PATCH'])
def updateUserColumns(userID):
    data=request.json
    allowedColumns=['username','name','password','bio','friendsList','questions','pinnedAnswers','dateJoined']
    jsonColumns=['friendsList','questions','pinnedAnswers'] #columns with json datatype, need to handle separately
    updateColumns=[col for col in data.keys() if col in allowedColumns] #elements are all keys from data that match to an element in allowedColumns

    if not updateColumns:
        return jsonify({"error": "No valid columns to update"}), 400
    
    conn=getDBConnection()
    cursor=conn.cursor()

    setClauses=[]
    values=[]

    for col in updateColumns:
        value=data[col]
        if col in jsonColumns and isinstance(value, list):
            value=json.dumps(value)
        if col in jsonColumns:
            setClauses.append("{0}=JSON_ARRAY_APPEND({0}, '$', %s)".format(col))
        else:
            setClauses.append("{0}=%s".format(col))
        values.append(value)

    setClause=', '.join(setClauses)
    query="UPDATE users SET {} WHERE userID=%s".format(setClause)
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