//generates string newQuestion onto the page
document.addEventListener('DOMContentLoaded', function() {
    function updateQuestion(newQuestion){
        const questionDiv=document.getElementsByClassName('question')[0];
        questionDiv.textContent=newQuestion
    }

    let questionString="how much deditated ram in the server for the server ya know i mean when i play minecraft on my server how much deditated ram do i need?";
    updateQuestion(questionString);
});

//changes the 3 bar menu to the X and adds show to the menu css id 
document.getElementById('menuIcon').addEventListener('click', function(){
    this.classList.toggle('change');
    document.getElementById('menu').classList.toggle('show');
    console.log("changing menu") //delete after debugged
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