document.addEventListener('DOMContentLoaded', function() {
    function updateQuestion(newQuestion){
        const questionDiv=document.getElementsByClassName('question')[0];
        questionDiv.textContent=newQuestion
    }

    let questionString="Is martyrdom for cowards?";
    updateQuestion(questionString);
});

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