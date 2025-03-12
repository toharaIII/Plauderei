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
    //setQuestion({content: "Test question: what is 2 + 2?"});
    console.log("Fetching question from API...");
    fetch("http://127.0.0.1:8000/questions/lowest/")
      .then(response => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched question data:", data);
        console.log("Data type:", typeof data);
        console.log("Data structure:", JSON.stringify(data, null, 2));
        setQuestion(data);
      })
      .catch(error => {
        console.error("Error fetching question:", error);
      });
  }, []);

  const fetchComments=()=>{
    fetch("http://127.0.0.1:8000/comments/random/")
    .then(response=>response.json())
    .then(data=>setComments(data))
    .catch(error=>console.error("Error fetching comments: ", error))
  };

  const handleQuestionClick = (e) => {
    // Stop propagation to prevent the click from being detected by the document click handler
    e.stopPropagation();
    fetchComments();
  };

  const handleCommentClick = (e, commentId) => {
    // Stop propagation to prevent the click from being detected by the document click handler
    e.stopPropagation();
    setActiveComment(activeComment === commentId ? null : commentId);
  };

  const handleReplyClick = (e, replyId) => {
    // Stop propagation to prevent the click from being detected by the document click handler
    e.stopPropagation();
    setActiveComment(activeComment === replyId ? null : replyId);
  };

  const handleOutsideClick = (event) => {
    const questionElement = document.querySelector('.question');
    const commentElements = document.querySelectorAll('.comment, .reply');
    
    let clickedInsideTarget = false;
    
    if (questionElement && questionElement.contains(event.target)) {
      clickedInsideTarget = true;
    }
    
    commentElements.forEach(element => {
      if (element.contains(event.target)) {
        clickedInsideTarget = true;
      }
    });
    
    if (!clickedInsideTarget) {
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
        <div className="question" onClick={(e) => handleQuestionClick(e)} style={{ cursor: 'pointer' }}>
          <h3>{question.question}</h3>
        </div>
      )}

      {comments.map(comment => (
        <div key={comment.id} className="comment" onClick={() => handleCommentClick(e, comment.id)}  style={{ cursor: 'pointer' }}>
          <p><strong>{comment.username}:</strong> {comment.content}</p>
          {activeComment === comment.id && comment.replies.length > 0 && (
            <div className="replies">
              {comment.replies.map(reply => (
                <div key={reply.id} className="reply" onClick={() => handleReplyClick(e, reply.id)}  style={{ cursor: 'pointer' }}>
                  <p><strong>{reply.username}:</strong> {reply.content}</p>
                </div>
              ))}
            </div>
          )}
          {user && <button onClick={(e) => e.stopPropagation()}>Reply</button>}
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
