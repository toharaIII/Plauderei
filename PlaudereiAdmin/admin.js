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
        const url=`http://127.0.0.1:5000/questionQueue`;
        let data={"question": question, "userID": userID};

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
            let adminSubmission=document.getElementById('adminSubmission').value;
            console.log(adminSubmission);
            addToQueue(adminSubmission, userID);
            document.getElementById('adminSubmission').value='';
        }
    });

    document.getElementById('allSubmissionsButton').addEventListener('click', function(event){
        let displayArea=document.getElementById('displayArea');
        displayArea.innerHTML='';

        const url=`http://127.0.0.1:5000/questionQueue`;

        fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.error) alert(data.error || 'cant add submissions to the list?');
            else{
                console.log(data);
                let displayArea=document.getElementById('displayArea');
                data.forEach(user => {
                    let submittedQuesitons=JSON.parse(user[2]);
                    submittedQuesitons.forEach(question => {
                        const questionDiv=document.createElement('div');
                        questionDiv.className='questionHolder';
                        const userName=document.createElement('div');
                        userName.textContent=user[1];
                        userName.className='userName';
                        questionDiv.appendChild(userName);
                        const questionText=document.createElement('div');
                        questionText.textContent=question;
                        questionText.className='questionText';
                        questionDiv.appendChild(questionText);
                        const addToQueueElement=document.createElement('button');
                        addToQueueElement.textContent='Add to Queue';
                        addToQueueElement.className='addToQueueElement';
                        addToQueueElement.addEventListener('click', function(){
                            addToQueue(question, user[0]);
                        });
                        questionDiv.appendChild(addToQueueElement);
                        displayArea.appendChild(questionDiv);
                    })
                })
            }
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to collect submissions. Please try again later.');
        });
    })

    function removeFromQueue(question){
        const url=`http://127.0.0.1:5000/questionQueue`;
        let data={"question": question};

        fetch(url, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.message) console.log('question removed from queue');
            else console.log(data.error || "cant remove from queue");
        })
        .catch((error)=>{
            console.error('Error:', error);
        });
    }

    document.getElementById('questionQueue').addEventListener('click', function(event){
        let displayArea=document.getElementById('displayArea');
        displayArea.innerHTML='';

        const url=`http://127.0.0.1:5000/questionQueueSubmissions`;

        fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.error) alert(data.error || 'cant get current queue');
            else{
                let displayArea=document.getElementById('displayArea');
                console.log(data);
                data.forEach(question => {
                    const questionDiv=document.createElement('div');
                    questionDiv.className='questionHolder';
                    questionDiv.textContent=question[0];
                    const removeFromQueueElement=document.createElement('button');
                    removeFromQueueElement.textContent='Remove From Queue';
                    removeFromQueueElement.className='addToQueueElement';
                    removeFromQueueElement.addEventListener('click', function(){
                        removeFromQueue(question[0]);
                    });
                    questionDiv.appendChild(removeFromQueueElement);
                    displayArea.appendChild(questionDiv);
                })
            }
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to collect Queue. Please try again later.');
        });
    })
});