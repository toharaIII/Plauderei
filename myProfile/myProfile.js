document.addEventListener('DOMContentLoaded', function() {
    let userAnswers=1;
    let userResponses=0;
    let userBadges=0;
    let userName="Trey.Ohara";
    let userFirst="Trey";
    let userLast="O'Hara";
    let dateJoined="August 2024";

    //providing current answers and responses for given user, no need to update since cant reduce or add on this page
    document.getElementById("answerCnt").textContent=userAnswers;
    document.getElementById("responseCnt").textContent=userResponses;

    document.getElementById("userName").textContent=userName;
    document.getElementById("firstName").textContent=userFirst;
    document.getElementById("lastName").textContent=userLast;
    document.getElementById("dateJoined").textContent=dateJoined;

    document.getElementById('menuIcon').addEventListener('click', function(){
        this.classList.toggle('change');
        const menuElement=document.getElementById('menu');
        const menuQuestionLine=document.querySelector('.menuQuestionLine');
        const questionDiv=document.querySelector('.question');

        //to toggle menu visibility
        menuElement.classList.toggle('show');
    });

    function populationFriendsList(friendsCnt){
        const friendsListContent=document.getElementById('friendsListContent');

        friendsListContent.innerHTML=''; //this wipes the existing drop down content

        //this actually populates the drop down
        for(let i=1; i<=friendsCnt; i++){
            const option=document.createElement('a');
            option.href='#'; //link to a friends page, iterate thru database
            option.textContent='friend ${i}'; //switch to the friends user name
            friendsListContent.appendChild(option);
        }
    }
    let friendCnt=15;
    populationFriendsList(friendCnt);

    document.querySelector('.showFriendsList').addEventListener('click', function(){
        const friendsListContent=document.getElementById('friendsListContent');
        friendsListContent.style.display=friendsListContent.style.display==='block'?'none':'block';
    });
});