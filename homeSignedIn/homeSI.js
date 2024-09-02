document.addEventListener('DOMContentLoaded', function() {
    let dailyAnswer=false;
    const signedIn=true;
    localStorage.getItem('signedInBoolean', signedIn);
    userId=localStorage.getItem('userID'); //for actual
    //let userId=15;//for page testing

    let questionString="Where does politics end and war begin?";
    let userAnswers=0;
    let userResponses=0;
    const answerBox=document.getElementById('userAnswer');
    const enterAnswer=document.getElementById('enterAnswer');
    const savedTextSpan=document.getElementById('savedAnswer');
    const questionDiv=document.querySelector('.question');
    const popup=document.getElementById('responsePopUp');

    //asigns the content of the questionDiv to whatever is held in the passed in newQuestion variable
    function updateQuestion(newQuestion){
        const questionDiv=document.getElementsByClassName('question')[0];
        questionDiv.textContent=newQuestion;
    }
    updateQuestion(questionString);

    function updateUI(){
        document.getElementById("answerCnt").textContent=userAnswers;
        document.getElementById("responseCnt").textContent=userResponses;

        if(dailyAnswer===true){
            alreadyAnswered.classList.add('show');
            answerBox.classList.add('hide');
            enterAnswer.classList.add('hide');
        }
    };

    function populatePage(){ 
        const url=`http://127.0.0.1:5000/data/${userId}`;
        console.log(url);

        fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.answerTotal) console.log('booya :P');
            else console.log(data.error || 'you dont seem to exist? Thats weird :|');
            userAnswers=data.answerTotal;
            userResponses=data.responsesRemaining;
            dailyAnswer=data.dailyAnswer;
            console.log(userAnswers, userResponses);
            updateUI();
        });
    };
    populatePage();

    //changes the 3 bar menu to the X and adds show to the menu css id 
    document.getElementById('menuIcon').addEventListener('click', function(){
        //setting up variables to change the question margins based on the size of the question string entered
        const menuElement=document.getElementById('menu');
        const menuQuestionLine=document.querySelector('.menuQuestionLine');
        const questionDiv=document.querySelector('.question');

        //to turn on menu visibility once clicked
        this.classList.toggle('change');
        menuElement.classList.toggle('show');

        //determine if the question div is wide enough to need adjustment when menu is present to prevent clipping
        if(menuElement.classList.contains('show')){
            const isWide=questionDiv.offsetWidth>(menuQuestionLine.offsetWidth-100)
            if(isWide) menuQuestionLine.classList.add('menu-open');
        } else menuQuestionLine.classList.remove('menu-open'); //removes adjustment for questionDiv if .show is not present
    });

    searchSubmit.addEventListener('click', function(){
        const url='http://127.0.0.1:5000/users/search';
        user=document.getElementById('userSearch').value;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({username: user})
        })
        .then(response => {
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if(data.success) {
                localStorage.setItem('searchUserName', user);
                localStorage.setItem('searchUserID', data.userID);
                window.location.href='../../searchedProfile/searchProfileIndex.html';
            } else {
                console.log('User not found:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    //saves the contents of answerBox to userAnswer and hides the textarea and enter answer button
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

    questionDiv.addEventListener('click', function(event){
        event.stopPropagation();
        popup.classList.add('show-popup');
        if(dailyAnswer==true) alreadyAnswered.classList.remove('show');
    });

    document.addEventListener('click', function(event){
        if(!popup.contains(event.target) && event.target!==questionDiv) {
            popup.classList.remove('show-popup');
            if(dailyAnswer==true) alreadyAnswered.classList.add('show');
        }
    });
});