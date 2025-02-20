import { homeMenu, search, populatePage, getPopUpAnswers, addAdminMenu} from "../common.js";

document.addEventListener('DOMContentLoaded', function() {
    let dailyAnswer=false;
    let signedInBoolean=true;
    localStorage.setItem('signedInBoolean', signedInBoolean);
    let userName=localStorage.getItem('userName');
    console.log(userName);
    let userId=localStorage.getItem('userID'); //for actual
    //let userId=15;//for page testing
    let userAnswers=0;
    let userResponses=0;

    let questionString="Where does politics end and war begin?";

    const questionDiv=document.querySelector('.question');
    function updateQuestion(newQuestion){
        const questionDiv=document.getElementsByClassName('question')[0];
        questionDiv.textContent=newQuestion;
    }
    updateQuestion(questionString);

    const answerBox=document.getElementById('userAnswer');
    const enterAnswer=document.getElementById('enterAnswer');
    function updateUI(){
        document.getElementById("answerCnt").textContent=userAnswers;
        document.getElementById("responseCnt").textContent=userResponses;
        console.log("daily answer:");
        console.log(dailyAnswer);

        if(dailyAnswer===true){
            alreadyAnswered.classList.add('show');
            answerBox.classList.add('hide');
            enterAnswer.classList.add('hide');
        } else{
            alreadyAnswered.classList.remove('show');
            answerBox.classList.remove('hide');
            enterAnswer.classList.remove('hide');
        }
    };

    function checkAdmin(userID){
        const url=`http://127.0.0.1:5000/admin/${userID}`;

        return fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
        })
        .then(response=>{
            if (!response.ok){
                console.log("network response not ok");
                return false;
            }
            return response.json();
        })
        .then(data=>{
            if(data.message){
                console.log('youre an admin!');
                return true;
            }
            if(data.error){
                console.log(data.error || 'This user isnt an admin');
                return false;
            }
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to check this. Please try again later.');
            return false;
        });
    }
    
    function loadPage(userId){
        populatePage(userId).then(data => {
            userAnswers=data.answerTotal;
            userResponses=data.responsesRemaining;
            dailyAnswer=data.dailyAnswer;
            updateUI();

            return checkAdmin(userId);
        })
        .then(adminStatus=> {
            localStorage.setItem('adminStatus', adminStatus);
            if(adminStatus===true) addAdminMenu();
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
    }
    loadPage(userId);

    const menuIcon=document.getElementById('menuIcon');
    menuIcon.addEventListener('click', homeMenu);

    const searchSubmit=document.getElementById('searchSubmit');
    searchSubmit.addEventListener('click', search);

    function saveText(){
        const userAnswer=answerBox.value;
        console.log("saved string: ", userAnswer);
        dailyAnswer=true;
        if (userAnswers<=0){
            alert("you dont have any remaining answers with which to submit this answer, sorry. :/")
            return;
        }
        userAnswers--;
        updateUI();

        let url=`http://127.0.0.1:5000/users/${userId}`;
        let data={answerTotal: userAnswers, dailyAnswer: true, todaysAnswer: userAnswer};
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
            else alert(data.error || 'seems like you\'ve already answered today, how do you see this button?');
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to submit this answer. Please try again later.');
        });

        url=`http://127.0.0.1:5000/submissions/${userId}`;
        data={submission: userAnswer, parentID: 15, userName: userName};
        fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.message) alert('oh yea :P')
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to post this submission. Please try again later.');
        });
    }
    enterAnswer.addEventListener('click', function(){
        saveText();
    });

    const popup=document.getElementById('responsePopUp');
    questionDiv.addEventListener('click', function(event){
        event.stopPropagation();
        popup.classList.add('show-popup');
        getPopUpAnswers(userId, signedInBoolean);
        if(dailyAnswer==true) alreadyAnswered.classList.remove('show');
    });

    document.addEventListener('click', function(event){
        if(!popup.contains(event.target) && event.target!==questionDiv) {
            popup.classList.remove('show-popup');
            if(dailyAnswer==true) alreadyAnswered.classList.add('show');
        }
    });
});