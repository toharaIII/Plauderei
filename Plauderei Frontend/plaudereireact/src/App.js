import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect} from 'react';
import {useUser} from "./context/UserProvider";

function App() {
  const { user, login, logout } = useUser();
  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState(null);
  
  useEffect(() => {
    setQuestion({content: "Test question: what is 2 + 2?"});
    /*fetch("http://127.0.0.1:8000/questions/lowest/") //this isnt working, the questions doesnt appear on screen
      .then(response => response.json())
      .then(data => {
        console.log("Fetched question:", data);
        setQuestion(data);
      })
      .catch(error => console.error("Error fetching question:", error));*/
  }, []);

  const fetchComments=()=>{
    fetch("http://127.0.0.1:8000/comments/random/")
    .then(response=>response.json())
    .then(data=>setComments(data))
    .catch(error=>console.error("Error fetching comments: ", error))
  };

  const handleQuestionClick=()=>{
    fetchComments();
  };

  const handleCommentClick=(commentId)=>{
    setActiveComment(activeComment===commentId ? null : commentId);
  };

  const handleReplyClick=(replyId)=>{
    setActiveComment(activeComment===replyId ? null : replyId);
  };

  const handleOutsideClick=(event)=>{
    if(!event.target.closest('.comment, .question')){
      setComments([]);
      setActiveComment(null);
    }
  };

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
          <input type="text" id="identifier" placeholder="Email or Username" />
          <input type="password" id="password" placeholder="Password" />
          <button onClick={() => {
            const identifier = document.getElementById("identifier").value;
            const password = document.getElementById("password").value;
            login(identifier, password);
          }}>Login</button>
        </div>
      )}

      {question && (
        <div className="question" onClick={handleQuestionClick}>
          <h3>{question.content}</h3>
        </div>
      )}

      {comments.map(comment => (
        <div key={comment.id} className="comment" onClick={() => handleCommentClick(comment.id)}>
          <p><strong>{comment.username}:</strong> {comment.content}</p>
          {activeComment === comment.id && comment.replies.length > 0 && (
            <div className="replies">
              {comment.replies.map(reply => (
                <div key={reply.id} className="reply" onClick={() => handleReplyClick(reply.id)}>
                  <p><strong>{reply.username}:</strong> {reply.content}</p>
                </div>
              ))}
            </div>
          )}
          {user && <button>Reply</button>}
        </div>
      ))}
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
