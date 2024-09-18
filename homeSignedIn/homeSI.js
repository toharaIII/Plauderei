import { homeMenu, search, populatePage, getPopUpAnswers, addAdminMenu} from "../common.js";

document.addEventListener('DOMContentLoaded', function() {
    let dailyAnswer=false;
    let signedInBoolean=true;
    localStorage.getItem('signedInBoolean', signedInBoolean);
    //let userId=localStorage.getItem('userID'); //for actual
    let userId=15;//for page testing
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
    const savedTextSpan=document.getElementById('savedAnswer');
    function updateUI(){
        document.getElementById("answerCnt").textContent=userAnswers;
        document.getElementById("responseCnt").textContent=userResponses;

        if(dailyAnswer===true){
            alreadyAnswered.classList.add('show');
            answerBox.classList.add('hide');
            enterAnswer.classList.add('hide');
        }
    };
    function checkAdmin(userID){
        const url='http://127.0.0.1:5000/admin';
        const data={userID: userID};

        fetch(url, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return false;
        })
        .then(data=>{
            if(data.message){
                alert('youre an admin!');
                return true;
            }
            else{
                alert(data.error || 'This user isnt an admin');
                return false;
            }
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to check this. Please try again later.');
            return false;
        });
    }
    
    populatePage(userId).then(data => {
        userAnswers=data.answerTotal;
        userResponses=data.responsesRemaining;
        dailyAnswer=data.dailyAnswer;
        console.log(userAnswers, userResponses);
        updateUI();
        adminStatus=checkAdmin(userId);
        localStorage.setItem('adminStatus', adminStatus);
        if(adminStatus===true) addAdminMenu();
    });

    const menuIcon=document.getElementById('menuIcon');
    menuIcon.addEventListener('click', homeMenu);

    const searchSubmit=document.getElementById('searchSubmit');
    searchSubmit.addEventListener('click', search);

    function saveText(){
        const userAnswer=answerBox.value;
        savedTextSpan.textContent=userAnswer;
        console.log("saved string: ", userAnswer);
        answerBox.classList.add('hide');
        enterAnswer.classList.add('hide');

        userAnswers--;
        document.getElementById("answerCnt").textContent=userAnswers;

        const url=`http://127.0.0.1:5000/users/${userId}`;
        const data={answerTotal: userAnswers, dailyAnswer: true};

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
            if(data.success) alert('booya :P')
            else alert(data.error || 'This User Doesnt seem to exist? Thats weird :|');
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to submit this answer. Please try again later.');
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