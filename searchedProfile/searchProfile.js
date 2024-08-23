document.addEventListener('DOMContentLoaded', function() {

    let badgesCnt=3;
    let userName="Jado";
    let name="Jad Yazbeck";
    let dateJoined="August 2024";
    let userEntry="first user!";
    let friendCnt=12;

    let submittedQuestionsArray=["Is determining when ai has reached agi a civil rights problem; as opposed to an engineering problem?",
        "Is there a blanket statement you can about when it becomes worth it to break laws?",
        "Is the inspiration for all non-hedonistic things legacy?"];

    let pinnedOneString='';
    let pinnedTwoString='';
    let pinnedThreeString='';

    //providing current answers and responses for given user, no need to update since cant reduce or add on this page

    document.getElementById("userName").textContent=userName;
    document.getElementById("name").textContent=name;
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

    function determineMaxBadges(){
        const profileInfoWidth=document.getElementById('profileInfo').offsetWidth;
        const maxDisplayedBadges=Math.floor((profileInfoWidth-30)/30)-1
        return maxDisplayedBadges;
    };

    function populateBadges(badgesCnt){
        maxDisplayedBadges=determineMaxBadges(); //need to make this dynamic

        const badgelocation=document.getElementById('badges');
        badgelocation.innerHTML='';

        badgesPrinted=badgesCnt<maxDisplayedBadges ? badgesCnt : maxDisplayedBadges; //determining number of badges to display
        for(let i=0; i<badgesPrinted; i++){ //adding badges to top of profile
            const badge=document.createElement('img');
            badge.src='../../badge.png';
            badgelocation.appendChild(badge);
        }
        if(badgesCnt>maxDisplayedBadges){ //print an integer if the user has more then 23 badges since thats how many can
            badgeRemainder=badgesCnt-maxDisplayedBadges;
            const additionalBadges=document.createElement('span');
            additionalBadges.textContent=`+${badgeRemainder}`;
            badgelocation.appendChild(additionalBadges);
        }
    }
    populateBadges(badgesCnt);
    window.addEventListener('resize', ()=> {
        populateBadges(badgesCnt);
    });

    function populateFriendsList(friendsCnt){
        const friendsListContent=document.getElementById('friendsListContent');
        friendsListContent.innerHTML=''; //this wipes the existing drop down content

        //this actually populates the drop down
        for(let i=0; i<friendsCnt; i++){
            const friend=document.createElement('a');
            friend.href='#'; //link to a friends page, iterate thru database
            friend.textContent=`friend ${i+1}`; //switch to the friends user name
            friendsListContent.appendChild(friend);
        }
    };
    populateFriendsList(friendCnt);
    document.querySelector('.showFriendsList').addEventListener('click', function(){
        const friendsListContent=document.getElementById('friendsListContent');
        friendsListContent.style.display=friendsListContent.style.display==='flex'?'none':'flex'; //cool different way of doing this, seems better then including a .show/.hide, switch all to this
    });

    //call with the second variable as a string
    function updatePinned(pinnedString, pinNum){
        if (pinnedString!=''){
            const pinnedNum=document.getElementById(`${pinNum}`);
            const string=document.createElement('span');
            string.textContent=`${pinnedString}`;
            pinnedNum.appendChild(string)
            pinnedNum.style.display=pinnedNum.style.display==='block'?'none':'block';
        }
    };
});