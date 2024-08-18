//generates string newQuestion onto the page
document.addEventListener('DOMContentLoaded', function() {
    function updateQuestion(newQuestion){
        const questionDiv=document.getElementsByClassName('question')[0];
        questionDiv.textContent=newQuestion
    }

    //let questionString="really big string like om gholy shit big string like zoo wee mama thats got to be at least 2 lines"
    let questionString="Where does politics end and war begin?";
    updateQuestion(questionString);

    //changes the 3 bar menu to the X and adds show to the menu css id 
    document.getElementById('menuIcon').addEventListener('click', function(){
        this.classList.toggle('change');
        const menuElement=document.getElementById('menu');
        const menuQuestionLine=document.querySelector('.menuQuestionLine');
        const questionDiv=document.querySelector('.question');

        //to toggle menu visibility
        menuElement.classList.toggle('show');

        //determine if the question div is wide enough to adjust when menu is present
        if(menuElement.classList.contains('show')){
            const isWide=questionDiv.offsetWidth>(menuQuestionLine.offsetWidth-100)
            //if(isWide) menuQuestionLine.classList.toggle('menu-open');
            if(isWide) menuQuestionLine.classList.add('menu-open');
        } else menuQuestionLine.classList.remove('menu-open'); //removes adjustment for questionDiv if .show is not present
    });
});

//saves the content added to the text box to savedTextSpan... i thinnk
document.addEventListener('DOMContentLoaded', function(){
    const answerBox=document.getElementById('userAnswer');
    const enterAnswer=document.getElementById('enterAnswer');
    const savedTextSpan=document.getElementById('savedAnswer');

    function saveText(){
        const userAnswer=answerBox.value;
        savedTextSpan.textContent=userAnswer;
        console.log("saved string: ", userAnswer)
    }

    enterAnswer.addEventListener('click', function(){
        saveText();
    });

    answerBox.addEventListener('keypress', function(event){
        if (event.key==='Enter'){
            event.preventDefault();
            saveText();
        }
    });
});