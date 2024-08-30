document.addEventListener('DOMContentLoaded', function() {
    
    let searchedUserId=localStorage.getItem('userID'); //gets the signed in user's userID
    let badgesCnt=3;
    let searchedUser=localStorage.getItem('searchUserName');
    let name="Jad Yazbeck";
    let dateJoined="August 2024";
    let userEntry="first user!";
    let friendCnt=3

    let pinnedOneString='';
    let pinnedTwoString='';
    let pinnedThreeString='';

    function populatePage(){
        //need to get all the shit so not username but osmething is wrong with that
        //but need name, dateJoined, number of badges, bio, pinned answers, friends list
        //need to build actual pinned answers and responses functionality as well
        //need to see if signed in user is friends with searched user and if so hide add friend button and show remove friend button
        //still need to test add and remvoe friend, need to find way to see live output of friendslist on mysql server
    }
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

    document.getElementById('addFriend').addEventListener('click', function(){
        const addButton=document.getElementById('addFriend');
        const removeButton=document.getElementById('removeFriend');
        addButton.classList.add('hide');
        removeButton.classList.add('show');

        const url=`http://127.0.0.1:5000/users/${searchedUserId}`;
        const data={friendsList: [searchedUser]};

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
            alert('An error occured while trying to add this user. Please try again later.');
        });
    });

    document.getElementById('removeFriend').addEventListener('click', function(){
        const removeButton=document.getElementById('removeFriend');
        const addButton=document.getElementById('addFriend');
        removeButton.classList.add('hide');
        addButton.classList.add('show');

        const url=`http://127.0.0.1:5000/users/${searchedUserId}/removeFriend`;
        const data={friend: searchedUser};

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
            if (data.message) alert('Friend removed successfully!');
            else alert(data.error || 'Failed to remove friend.');
        })
        .catch(error=>{
            console.error('Error:', error);
            alert('An error occurred while trying to remove this user. Please try again later.');
        });
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