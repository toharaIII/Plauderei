document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('menuIcon').addEventListener('click', function(){
        this.classList.toggle('change');
        const menuElement=document.getElementById('menu');
        const menuQuestionLine=document.querySelector('.menuQuestionLine');
        const questionDiv=document.querySelector('.question');

        //to toggle menu visibility
        menuElement.classList.toggle('show');
    });
});

let userAnswers=1;
let userResponses=0;
document.getElementById("answerCnt").textContent=userAnswers;
document.getElementById("responseCnt").textContent=userResponses;