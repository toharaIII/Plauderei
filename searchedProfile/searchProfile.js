import { profileMenu, search, populatePage, populateBadges, populateFriendsList, getTodaysAnswer } from "../common.js";

document.addEventListener('DOMContentLoaded', function() {
    
    //let searchedUserId=localStorage.getItem('searchUserID');
    let searchedUserId=15;
    let badgesCnt=0;
    let searchedUser=localStorage.getItem('searchUserName');
    let name="";
    let dateJoined="";
    let userBio="";
    let friendCnt=0;
    let friends=[];
    let pinnedAnswers=[];

    const searchSubmit=document.getElementById('searchSubmit');
    searchSubmit.addEventListener('click', search);

    console.log(searchedUserId);
    console.log(localStorage.getItem('searchUserName'), localStorage.getItem('searchUserID'));

    function updateUI(){
        document.getElementById("userName").textContent=searchedUser;
        document.getElementById("name").textContent=name;
        document.getElementById("dateJoined").textContent=dateJoined;
        document.getElementById("userEntry").textContent=userBio;
    }

    populatePage(searchedUserId).then(data => {
        name=data.name || 'No Name';
        dateJoined=data.dateJoined;
        userBio=data.bio || 'No Bio';
        badgesCnt=data.badges;
        friends=Array.isArray(data.friendsList) ? data.friendsList : (data.friendsList ? JSON.parse(data.friendsList) : []);
        friendCnt=friends.length;
        pinnedAnswers=Array.isArray(data.pinnedAnswers) ? data.pinnedAnswers : (data.pinnedAnswers ? JSON.parse(data.pinnedAnswers) : []);
        updateUI();
        populateBadges(badgesCnt);
        populateFriendsList(friendCnt);
        getTodaysAnswer(searchedUserId);
    })
    
    const menuIcon=document.getElementById('menuIcon');
    menuIcon.addEventListener('click', profileMenu);

    window.addEventListener('resize', ()=> {
        populateBadges(badgesCnt);
    });

    document.querySelector('.showFriendsList').addEventListener('click', function(){
        const friendsListContent=document.getElementById('friendsListContent');
        friendsListContent.style.display=friendsListContent.style.display==='flex'?'none':'flex'; //cool different way of doing this, seems better then including a .show/.hide, switch all to this
    });

    document.getElementById('addFriend').addEventListener('click', function(){
        const signedIn=localStorage.getItem('signedInBoolean');

        if (signedIn==='false') {
            console.log('User is not signed in. Cannot add a friend.');
            return;
        }

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