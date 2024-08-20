document.addEventListener('DOMContentLoaded', function() {
    let dailyAnswer=false;
    //let questionString="really big string like om gholy shit big string like zoo wee mama thats got to be at least 2 lines"
    let questionString="Where does politics end and war begin?";
    let userAnswers=1;
    let userResponses=0;
    const answerBox=document.getElementById('userAnswer');
    const enterAnswer=document.getElementById('enterAnswer');
    const savedTextSpan=document.getElementById('savedAnswer');
    const questionDiv=document.querySelector('.question');
    const popup=document.getElementById('responsePopUp');

    //if the user has already answer todays question it hides the textarea and the enter button and shows the alreadyAnswered div
    if(dailyAnswer==true){
        alreadyAnswered.classList.add('show');
        answerBox.classList.add('hide');
        enterAnswer.classList.add('hide');
    }

    //asigns the content of the questionDiv to whatever is held in the passed in newQuestion variable
    function updateQuestion(newQuestion){
        const questionDiv=document.getElementsByClassName('question')[0];
        questionDiv.textContent=newQuestion;
    }
    updateQuestion(questionString);

    //assigning the number of answers the user has based on the number of responses
    document.getElementById("answerCnt").textContent=userAnswers;
    document.getElementById("responseCnt").textContent=userResponses;

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

    //saves the contents of answerBox to userAnswer and hides the textarea and enter answer button
    function saveText(){
        const userAnswer=answerBox.value;
        savedTextSpan.textContent=userAnswer;
        console.log("saved string: ", userAnswer);
        answerBox.classList.add('hide');
        enterAnswer.classList.add('hide');

        userAnswers--;
        document.getElementById("answerCnt").textContent=userAnswers;
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