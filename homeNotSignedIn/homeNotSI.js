import { homeMenu, removeShow, search } from "../common.js";

document.addEventListener('DOMContentLoaded', function() {
    let signedInBoolean=false;
    localStorage.setItem('signedInBoolean', signedInBoolean); //will prevent people that arent signed in from doing signed in shit

    let questionString="Where does politics end and war begin?";

    function updateQuestion(newQuestion){ //this we will probably want ot move to common once this gets bigger with new table shit
        const questionDiv=document.getElementsByClassName('question')[0];
        questionDiv.textContent=newQuestion
    }
    updateQuestion(questionString);

    const menuIcon=document.getElementById('menuIcon')
    menuIcon.addEventListener('click', homeMenu);

    const searchSubmit=document.getElementById('searchSubmit');
    searchSubmit.addEventListener('click', search);

    const questionDiv=document.querySelector('.question');
    const signIn=document.getElementById('signIn');
    const popup=document.getElementById('responsePopUp');

    function populatePopUp(answers){
        const popup=document.getElementById('responsePopUp');
        popup.innerHTML='';

        answers.forEach(answer => {
            const {submission, parentID}=answer;
            const answerItem=document.createElement('div');
            answerItem.textContent=submission;
            answerItem.classList.add('answer');
            popup.appendChild(answerItem);

            answerItem.addEventListener('click', function () {
                let existingTextarea=popup.querySelector('textarea');
                if (existingTextarea) existingTextarea.remove();

                const textarea=document.createElement('textarea');
                textarea.placeholder='Type your response here and press Enter...';
                textarea.classList.add('responseEntry');
                popup.insertBefore(textarea, answerItem.nextSibling);
                popup.style.display='flex';
                popup.style.flexDirection='column';

                textarea.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
    
                        const submission=textarea.value.trim();
                        if (submission) {
                            const data = {
                                submission: submission,
                                parentID: parentID
                            };

                            fetch(`http://127.0.0.1:5000/submissions/${userID}`, {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                                body: JSON.stringify(data)
                            })
                            .then(response => {
                                if (!response.ok) throw new Error('Network response was not ok');
                                return response.json();
                            })
                            .then(data => {
                                if (data.error) console.error(data.error);
                                else {
                                    console.log('Response submitted successfully:', data.message);
                                    textarea.remove(); 
                                }
                            })
                            .catch(error => {
                                console.error('Error submitting the response:', error);
                            });
                        }
                    }
                });
            });
        });
    }

    function getPopUpAnswers(userID){
        const url='http://127.0.0.1:5000/submissions';
        console.log(url);

        fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, 
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.error) console.log(data.error || 'you dont seem to exist? Thats weird :|');
            else{
                console.log('booya :P');
                const answers=data.map(row=>({submission: row[2], parentID: row[0]}));
                populatePopUp(answers, userID);
            }
        });


    }

    questionDiv.addEventListener('click', function(event){
        event.stopPropagation();
        popup.classList.add('show-popup');
        populatePopUp();
        signIn.classList.add('move')
    });

    document.addEventListener('click', function(event){
        if(!popup.contains(event.target) && event.target!==questionDiv){
            popup.classList.remove('show-popup');
            signIn.classList.remove('move')
        }
    });

    const signInPopUp=document.getElementById('signInPopUp');
    signIn.addEventListener('click', function(event){
        event.stopPropagation();
        signInPopUp.classList.add('show');
    });

    signInSubmit.addEventListener('click', function(){
        const username=document.getElementById('emailUser').value;
        const password=document.getElementById('emailUserPassword').value;

        const data={username: username, password: password};

        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.message){
                localStorage.setItem('userID', data.userID);
                window.location.href='../../homeSignedIn/homeSIIndex.html';
            }else alert(data.error || 'Invalid username or password. Please try again.');
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to log in. Please try again later.')
        });
    });

    document.addEventListener('click', (event) => removeShow(event, signInPopUp));

    createAccount.addEventListener('click', function(event){
        event.stopPropagation();
        createAccountPopUp.classList.add('show');
    });

    createAccountSubmit.addEventListener('click', function(){
        const username=document.getElementById('newUser').value;
        const password=document.getElementById('newUserPassword').value;
    
        const data={
            username: username,
            password: password
        };
    
        fetch('http://127.0.0.1:5000/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.message) window.location.href = '../../homeSignedIn/homeSIIndex.html';
            else alert(data.error || 'Failed to create account. Please try again.');
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occurred while trying to create your account. Please try again later.');
        });
    });

    document.addEventListener('click', (event) => removeShow(event, createAccountPopUp));
});