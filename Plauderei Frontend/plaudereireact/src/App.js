import logo from './logo.svg';
import './App.css';
import react, {useContext} from 'react';
import {userContext} from "./context/UserContext";

function App() {
  const{user, login, logout}=userContext(userContext);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Plauderei</h1>

        {user ? (
          <div>
            <p>Logged in as: {user.username}</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={()=>login("exampleUser")}>Login</button>
        )}
      </header>
    </div>
  );
}

export default App;
