import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect} from 'react';
import {useUser} from "./context/UserProvider";

function App() {
  const { user, login, logout } = useUser();
  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
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

  const handleReplyClick = (e, commentId) => {
    // Stop propagation to prevent the click from being detected by the document click handler
    e.stopPropagation();
    // Toggle reply input visibility
    setReplyingTo(replyingTo === commentId ? null : commentId);
    // Reset reply text when opening/closing reply input
    setReplyText('');
  };

  const handleReplyTextChange = (e) => {
    setReplyText(e.target.value);
  };

  const submitReply = (parentId) => {
    if (!user || !replyText.trim()) {
      console.log("Cannot submit: no user or empty reply");
      return;
    }

    console.log("User object:", user);

    const replyData = {
      content: replyText.trim(),
      user_uuid: user.user_uuid,
      username: user.username,
      parent_id: parentId
    };

    console.log("Submitting reply:", replyData);

    fetch("http://127.0.0.1:8000/comments/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replyData),
    })
    .then(response => {
      console.log("Reply submission response status:", response.status);
      if (!response.ok) {
        // Log detailed error information
        return response.text().then(text => {
          console.error("Error details:", text);
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${text}`);
        });
      }
      return response.json();
    })
    .then(newReply => {
      console.log("Successfully added reply:", newReply);
      // Update local comments state to include the new reply
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.id === parentId) {
            // Create a new comment object with the updated replies array
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        });
      });
      
      // Clear the reply input and hide it
      setReplyText('');
      setReplyingTo(null);
      
      // Make sure the comment with the new reply is expanded
      setActiveComment(parentId);
    })
    .catch(error => {
      console.error("Error posting reply:", error);
    });
  };

  const handleOutsideClick = (e) => {
    const questionElement = document.querySelector('.question');
    const commentElements = document.querySelectorAll('.comment, .reply, .reply-input');
    
    let clickedInsideTarget = false;
    
    if (questionElement && questionElement.contains(e.target)) {
      clickedInsideTarget = true;
    }
    
    commentElements.forEach(element => {
      if (element && element.contains(e.target)) {
        clickedInsideTarget = true;
      }
    });
    
    if (!clickedInsideTarget) {
      setComments([]);
      setActiveComment(null);
      setReplyingTo(null);
    }
  };

  // Add event listener for outside clicks
  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

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
        <div key={comment.id} className="comment" onClick={(e) => handleCommentClick(e, comment.id)} style={{ cursor: 'pointer' }}>
          <p><strong>{comment.username}:</strong> {comment.content}</p>
          
          {/* Reply button for the original comment */}
          {user && (
            <div onClick={(e) => e.stopPropagation()}>
              <button onClick={(e) => handleReplyClick(e, comment.id)}>
                {replyingTo === comment.id ? 'Cancel' : 'Reply'}
              </button>
              
              {replyingTo === comment.id && (
                <div className="reply-input">
                  <textarea 
                    value={replyText}
                    onChange={handleReplyTextChange}
                    placeholder="Write your reply..."
                    rows="3"
                  />
                  <button onClick={() => submitReply(comment.id)}>Submit Reply</button>
                </div>
              )}
            </div>
          )}
          
          {/* Replies section */}
          {activeComment === comment.id && comment.replies && comment.replies.length > 0 && (
            <div className="replies">
              {comment.replies.map(reply => (
                <div key={reply.id} className="reply">
                  <p><strong>{reply.username}:</strong> {reply.content}</p>
                  
                  {/* Reply button for each reply */}
                  {user && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => handleReplyClick(e, reply.id)}>
                        {replyingTo === reply.id ? 'Cancel' : 'Reply'}
                      </button>
                      
                      {replyingTo === reply.id && (
                        <div className="reply-input">
                          <textarea 
                            value={replyText}
                            onChange={handleReplyTextChange}
                            placeholder="Write your reply..."
                            rows="3"
                          />
                          <button onClick={() => submitReply(reply.id)}>Submit Reply</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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