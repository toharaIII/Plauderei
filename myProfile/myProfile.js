document.addEventListener('DOMContentLoaded', function() {
    let userAnswers=1;
    let userResponses=0;
    let badgesCnt=2;
    let userName="Trey.Ohara";
    let userFirst="Trey";
    let userLast="O'Hara";
    let dateJoined="August 2024";
    let userEntry="hey, im the dev!";
    let friendCnt=35;

    //providing current answers and responses for given user, no need to update since cant reduce or add on this page
    document.getElementById("answerCnt").textContent=userAnswers;
    document.getElementById("responseCnt").textContent=userResponses;

    document.getElementById("userName").textContent=userName;
    document.getElementById("firstName").textContent=userFirst;
    document.getElementById("lastName").textContent=userLast;
    document.getElementById("dateJoined").textContent=dateJoined;
    document.getElementById("userEntry").textContent=userEntry;

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
        for(let i=0; i<friendsCnt; i++){
            const friend=document.createElement('a');
            friend.href='#'; //link to a friends page, iterate thru database
            friend.textContent='friend'; //switch to the friends user name
            friendsListContent.appendChild(friend);
        }
    }
    populationFriendsList(friendCnt);

    function populateBadges(badgesCnt){
        const badgelocation=document.getElementById('badges');
        badgelocation.innerHTML='';

        for(let i=0; i<badgesCnt; i++){
            const badge=document.createElement('img');
            badge.src='../../badge.png';
            badgelocation.appendChild(badge);
        }
    }
    populateBadges(badgesCnt);

    document.querySelector('.showFriendsList').addEventListener('click', function(){
        const friendsListContent=document.getElementById('friendsListContent');
        friendsListContent.style.display=friendsListContent.style.display==='flex'?'none':'flex'; //cool different way of doing this, seems better then including a .show/.hide, switch all to this
    });
});