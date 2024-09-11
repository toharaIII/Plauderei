import { profileMenu, search, populatePage, populateBadges, populateFriendsList, getTodaysAnswer } from "../common.js";

document.addEventListener('DOMContentLoaded', function() {
    let userAnswers=0;
    let userResponses=0;

    //let userID=localStorage.getItem('userID');
    let userID=1;
    let badgesCnt=0;
    let userName="";
    let name="";
    let dateJoined="";
    let userEntry="";
    let friendCnt=0;
    let friends=[];
    let pinnedAnswers=[];
    let submittedQuestionsArray=[];

    function updateUI(){
        document.getElementById("userName").textContent=userName;
        document.getElementById("name").textContent=name;
        document.getElementById("dateJoined").textContent=dateJoined;
        document.getElementById("userEntry").textContent=userEntry;
        document.getElementById("answerCnt").textContent=userAnswers;
        document.getElementById("responseCnt").textContent=userResponses;
    }

    populatePage(userID).then(data => {
        userName=data.username;
        name=data.name || 'No Name';
        dateJoined=data.dateJoined;
        userEntry=data.bio || 'No Bio';
        badgesCnt=data.badges;
        userAnswers=data.answerTotal;
        userResponses=data.responsesRemaining;
        friends=Array.isArray(data.friendsList) ? data.friendsList : (data.friendsList ? JSON.parse(data.friendsList) : []);
        friendCnt=friends.length;
        pinnedAnswers=Array.isArray(data.pinnedAnswers) ? data.pinnedAnswers : (data.pinnedAnswers ? JSON.parse(data.pinnedAnswers) : []);
        submittedQuestionsArray = Array.isArray(data.submittedQuestions) ? data.submittedQuestions : (data.submittedQuestions ? JSON.parse(data.submittedQuestions) : []);
        updateUI();
        populateBadges(badgesCnt);
        populateFriendsList(friendCnt, friends);
        populateSubmittedQuestions(submittedQuestionsArray);
        getTodaysAnswer(userID);
    })

    const menuIcon=document.getElementById('menuIcon');
    menuIcon.addEventListener('click', profileMenu);

    const searchSubmit=document.getElementById('searchSubmit');
    searchSubmit.addEventListener('click', search);

    document.getElementById('changeName').addEventListener('keypress', function(event) {
        if (event.key==='Enter') {
            newName=event.target.value;
            const url=`http://127.0.0.1:5000/users/${userID}`;
            const data={name: newName};

            fetch(url, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            .then(response=>{
                if(!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data=>{
                if(data.message) alert('booya :P')
                else alert(data.error || 'cant add to the list?');
                location.reload();
            })
            .catch((error)=>{
                console.error('Error:', error);
                alert('An error occured while trying to submit this Name. Please try again later.');
            });
        }
    });

    document.getElementById('changeBio').addEventListener('keypress', function(event) {
        if (event.key==='Enter') {
            userEntry=event.target.value;
            const url=`http://127.0.0.1:5000/users/${userID}`;
            const data={bio: userEntry};

            fetch(url, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            .then(response=>{
                if(!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data=>{
                if(data.message) alert('booya :P')
                else alert(data.error || 'cant add to the list?');
                location.reload();
            })
            .catch((error)=>{
                console.error('Error:', error);
                alert('An error occured while trying to submit this Bio. Please try again later.');
            });
        }
    });

    window.addEventListener('resize', ()=> {
        populateBadges(badgesCnt);
    });

    document.querySelector('.settingsButton').addEventListener('click', function(){
        const settingsContent=document.getElementById('settingsContent');
        settingsContent.style.display=settingsContent.style.display==='flex'?'none':'flex'; //cool different way of doing this, seems better then including a .show/.hide, switch all to this
    });

    document.querySelector('.showFriendsList').addEventListener('click', function(){
        const friendsListContent=document.getElementById('friendsListContent');
        friendsListContent.style.display=friendsListContent.style.display==='flex'?'none':'flex'; //cool different way of doing this, seems better then including a .show/.hide, switch all to this
    });

    const enterQuestion=document.getElementById('submitQuestion');
    function submitQuestionFromTextarea(submittedQuestionsArray){
        const questionTextarea=document.getElementById('userQuestion');
        let question=questionTextarea.value
        submittedQuestionsArray.push(questionTextarea.value);
        populateSubmittedQuestions(submittedQuestionsArray);

        const url=`http://127.0.0.1:5000/users/${userID}`;
        const data={submittedQuestions: [question]};

        fetch(url, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.message) alert('booya :P')
            else alert(data.error || 'cant add to the list?');
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to submit this question. Please try again later.');
        });
        questionTextarea.value='';
    };
    enterQuestion.addEventListener('click', function(){
        submitQuestionFromTextarea(submittedQuestionsArray);
    });

    function populateSubmittedQuestions(submittedQuestionsArray){
        const submittedQuestionsContent=document.getElementById('submittedQuestionsContent');
        submittedQuestionsContent.innerHTML='';

        for(let i=submittedQuestionsArray.length-1; i>=0; i--){
            const question=document.createElement('div');
            question.textContent=submittedQuestionsArray[i];
            submittedQuestionsContent.appendChild(question);
        }
    };
    populateSubmittedQuestions(submittedQuestionsArray);
    document.querySelector('.showSubmittedQuestions').addEventListener('click', function(){
        const submittedQuestionsContent=document.getElementById('submittedQuestionsContent');
        submittedQuestionsContent.style.display=submittedQuestionsContent.style.display==='flex'?'none':'flex';
    });

    //call with the second variable as a string
    function updatePinned(pinnedString, pinNum){
        if (pinnedString!=''){
            const pinnedNum=document.getElementById(`${pinNum}`);
            const string=document.createElement('span');
            string.textContent=`${pinnedString}`;
            pinnedNum.appendChild(string)
            pinnedNum.style.display=pinnedNum.style.display==='block'?'none':'block';
        }
    };
});