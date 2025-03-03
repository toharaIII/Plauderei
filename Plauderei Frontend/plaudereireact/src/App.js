import logo from './logo.svg';
import './App.css';
import React from 'react';
import {useUser} from "./context/UserProvider";

function App() {
  const{user, login, logout}=useUser();

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.username}!</h2>
          <p>Email: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Login</h2>
          <input type="text" id="identifier" placeholder="Email or Username"/>
          <input type="password" id="password" placeholder="Password"/>
          <button onClick={()=>{
            const identifier=document.getElementById("identifier").value;
            const password=document.getElementById("password").value;
            login(identifier,password);
          }}>Login</button>
        </div>
      )}
    </div>
  );
}

function ProtectedPage(){
  const {user}=useUser();
  if(!user){
    return <p>Please log in to access this page.</p>;
  }

  return <h2>Welcome to the protected page, {user.username}!</h2>
}

const fetchUserProfile=async(user_uuid)=>{
  const response=await fetch(`http://127.0.0.1:8000/user/${user_uuid}`);
  const data=await response.json();
  console.log(data);
};

export default App;
