//generates string newQuestion onto the page
document.addEventListener('DOMContentLoaded', function() {
    //let questionString="really big string like om gholy shit big string like zoo wee mama thats got to be at least 2 lines"
    let questionString="Where does politics end and war begin?";
    const questionDiv=document.querySelector('.question');
    const popup=document.getElementById('responsePopUp');
    const signIn=document.getElementById('signIn');
    const signInPopUp=document.getElementById('signInPopUp')

    function updateQuestion(newQuestion){
        const questionDiv=document.getElementsByClassName('question')[0];
        questionDiv.textContent=newQuestion
    }
    updateQuestion(questionString);

    //changes the 3 bar menu to the X and adds show to the menu css id 
    document.getElementById('menuIcon').addEventListener('click', function(){
        //setting up variables to change the question margins based on the size of the question string entered
        const menuElement=document.getElementById('menu');
        const menuQuestionLine=document.querySelector('.menuQuestionLine');
        const questionDiv=document.querySelector('.question');

        //to turn on menu visibility once clicked
        menuElement.classList.toggle('show');
        this.classList.toggle('change');

        //determine if the question div is wide enough to need adjustment when menu is present to prevent clipping
        if(menuElement.classList.contains('show')){
            const isWide=questionDiv.offsetWidth>(menuQuestionLine.offsetWidth-100)
            if(isWide) menuQuestionLine.classList.add('menu-open');
        } else menuQuestionLine.classList.remove('menu-open'); //removes adjustment for questionDiv if .show is not present
    });

    questionDiv.addEventListener('click', function(event){
        event.stopPropagation();
        popup.classList.add('show-popup');
        signIn.classList.add('move')
    });

    document.addEventListener('click', function(event){
        if(!popup.contains(event.target) && event.target!==questionDiv){
            popup.classList.remove('show-popup');
            signIn.classList.remove('move')
        }
    });

    signIn.addEventListener('click', function(event){
        event.stopPropagation();
        signInPopUp.classList.add('show');
    });

    document.addEventListener('click', function(event){
        if(!signInPopUp.contains(event.target) && event.target!==signInPopUp){
            signInPopUp.classList.remove('show');
        }
    });
});