import { profileMenu, search, populatePage, populateBadges, populateFriendsList, getTodaysAnswer } from "../common.js";

document.addEventListener('DOMContentLoaded', function() {
    let userAnswers=0;
    let userResponses=0;

    let userID=localStorage.getItem('userID');
    //let userID=1; //for testing
    let adminStatus=localStorage.getItem('adminStatus');
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
        getTodaysAnswer(userID, true);
        //populatePinnedAnswers();
        if(adminStatus===true) addAdminMenu();
    })

    const menuIcon=document.getElementById('menuIcon');
    menuIcon.addEventListener('click', profileMenu);

    const searchSubmit=document.getElementById('searchSubmit');
    searchSubmit.addEventListener('click', search);

    document.getElementById('changeName').addEventListener('keypress', function(event) {
        if (event.key==='Enter') {
            let newName=event.target.value;
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
        const questionTextarea = document.getElementById('userQuestion');
        let question = questionTextarea.value;

        const url = `http://127.0.0.1:5000/users/${userID}`;
        const data = { submittedQuestions: [question] };

        fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.message) alert('booya :P');
            else alert(data.error || 'cant add to the list?');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while trying to submit this question. Please try again later.');
        });
        questionTextarea.value = '';
    };
    enterQuestion.addEventListener('click', function(){
        submitQuestionFromTextarea(submittedQuestionsArray);
    });

    function populateSubmittedQuestions(submittedQuestionsArray){
        const submittedQuestionsContent = document.getElementById('submittedQuestionsContent');
        submittedQuestionsContent.innerHTML = '';

        const url=`http://127.0.0.1:5000/data/${userID}`;
    
        fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if(data.submittedQuestions){
                submittedQuestionsArray=[...data.submittedQuestions];

                console.log(submittedQuestionsArray);
                for(let i=submittedQuestionsArray.length-1; i>=0; i--) {
                    const question=document.createElement('div');
                    question.textContent=submittedQuestionsArray[i];
                    submittedQuestionsContent.appendChild(question);
                }
            }else{
                alert(data.error || 'Could not fetch submitted questions');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while trying to fetch the questions. Please try again later.');
        });
    };
    document.querySelector('.showSubmittedQuestions').addEventListener('click', function(){
        const submittedQuestionsContent=document.getElementById('submittedQuestionsContent');
        submittedQuestionsContent.style.display=submittedQuestionsContent.style.display==='flex'?'none':'flex';
        if(submittedQuestionsContent.style.display=='flex') populateSubmittedQuestions(submittedQuestionsArray);
    });

    //I HAVENT TESTED ANY OF THIS PINNED SHIT SO NONE OF THE PINNED SHIT IN THE TODAYSANSWER FUNCTION EITHER
//     function updatePinned(answerText){


//         value=[/*will hold the question when i create the admin page and that table*/,answerText];

//         const url=`http://127.0.0.1:5000/users/${userID}`;
//         const data={pinnedAnswers: value};

//         fetch(url, {
//             method: 'PATCH',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify(data)
//         })
//         .then(response=>{
//             if(!response.ok) throw new Error('Network response was not ok');
//             return response.json();
//         })
//         .then(data=>{
//             if(data.message) alert('booya :P')
//             else alert(data.error || 'cant add to the list?');
//         })
//         .catch((error)=>{
//             console.error('Error:', error);
//             alert('An error occured while trying to submit this question. Please try again later.');
//         });
//     };

//     function populatePinnedAnswers(){
//         if(pinnedAnswers.length()>0){
//             for(let i=0; i<pinnedAnswers.length(); i++){
//                 let pinned=document.createElement('div');
//                 pinned.className="pinned";
//                 let question=document.createElement('p');
//                 question.textContent=pinnedAnswers[i][0];
//                 pinned.appendChild(question);
//                 let answer=document.createElement('p');
//                 answer.textContent=pinnedAnswers[i][1];
//                 pinned.appendChild(answer);
//             }
//         }
//     }
});