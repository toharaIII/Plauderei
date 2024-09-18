import {profileMenu, search, populatePage} from "../common.js";
document.addEventListener('DOMContentLoaded', function() {
    let userAnswers=0;
    let userResponses=0;
    //let userID=localStorage.getItem('userID');
    let userID=1;
    
    function updateUI(){
        document.getElementById("answerCnt").textContent=userAnswers;
        document.getElementById("responseCnt").textContent=userResponses;
    }
    populatePage(userID).then(data => {
        userAnswers=data.answerTotal;
        userResponses=data.responsesRemaining;
        updateUI();
    })

    const menuIcon=document.getElementById('menuIcon');
    menuIcon.addEventListener('click', profileMenu);

    const searchSubmit=document.getElementById('searchSubmit');
    searchSubmit.addEventListener('click', search);

    function addToQueue(question, userID){
        const url=`http://127.0.0.1:5000//questionQueue`;
        data={"question": question, "userID": userID};

        fetch(url, {
            method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.message) console.log('question added to queue');
            else console.log(data.error || "cant add to queue");
        })
        .catch((error)=>{
            console.error('Error:', error);
        });
    }

    document.getElementById('adminSubmission').addEventListener('keydown', function(event){
        if(event.key==='Enter'){
            event.preventDefault();
            let adminSubmission=document.getElementById('adminSubmission').textContent;
            addToQueue(adminSubmission, userID);
        }
    });

    document.getElementById('allSubmissionsButton').addEventListener('click', function(event){
        let displayArea=document.getElementById('displayArea');
        displayArea.innerHTML='';

        const url=`http://127.0.0.1:5000//questionQueue`;

        fetch(url, {
            method: 'GET',
                headers: {'Content-Type': 'application/json'},
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.error) alert(data.error || 'cant add submissions to the list?');
            else{
                data.foreach(user => {
                    let submittedQuesitons=JSON.parse(user[2]);
                    submittedQuesitons.foreach(question => {
                        const questionDiv=document.createElement('div');
                        questionDiv.className='questionHolder';
                        const userName=document.createElement('p');
                        userName.textContent=user[1];
                        questionDiv.appendChild(userName);
                        questionDiv.appendChild(question);
                        const addToQueueElement=document.createElement('button');
                        addToQueueElement.textContent='Add to Queue';
                        questionDiv.appendChild(addToQueueElement);
                        addToQueueElement.addEventListener('click', addToQueue(question, user));
                    })
                })
            }
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to collect submissions. Please try again later.');
        });
    })

    //not sure why this is here or if it was needed
    /*document.getElementById('allSubmissionsButton').addEventListener('click', function(event){
        let displayArea=document.getElementById('displayArea');
        displayArea.innerHTML='';
    })*/ 
});