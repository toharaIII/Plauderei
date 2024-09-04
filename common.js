export function search(event){
    event.preventDefault();

    const user=document.getElementById('userSearch').value;
    const url='http://127.0.0.1:5000/users/search';

    console.log(user.value);
    console.log(typeof(user.value));

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({username: user})
    })
    .then(response => {
        if(!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if(data.message) {
            localStorage.setItem('searchUserName', user);
            localStorage.setItem('searchUserID', data.userID);
            window.location.href='../../searchedProfile/searchProfileIndex.html';
        } else {
            console.log('User not found:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

export function homeMenu(event){
    const menuElement=document.getElementById('menu');
    const menuQuestionLine=document.querySelector('.menuQuestionLine');
    const questionDiv=document.querySelector('.question');

    menuElement.classList.toggle('show');
    this.classList.toggle('change');

    if(menuElement.classList.contains('show')){
        const isWide=questionDiv.offsetWidth>(menuQuestionLine.offsetWidth-100)
        if(isWide) menuQuestionLine.classList.add('menu-open');
    } else menuQuestionLine.classList.remove('menu-open');
}

export function profileMenu(evnet){
    this.classList.toggle('change');
    const menuElement=document.getElementById('menu');
    const menuQuestionLine=document.querySelector('.menuQuestionLine');
    const questionDiv=document.querySelector('.question');

    menuElement.classList.toggle('show');
}

export function removeShow(event, div){
    if(!div.contains(event.target)) div.classList.remove('show');
}

export function populatePage(userId){ 
    const url=`http://127.0.0.1:5000/data/${userId}`;
    console.log(url);

    return fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
    .then(response=>{
        if(!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data=>{
        if(data.username) console.log('booya :P');
        else console.log(data.error || 'you dont seem to exist? Thats weird :|');
        return data;
    });
}

function determineMaxBadges(){
    const profileInfoWidth=document.getElementById('profileInfo').offsetWidth;
    const maxDisplayedBadges=Math.floor((profileInfoWidth-30)/30)-1
    return maxDisplayedBadges;
}

export function populateBadges(badgesCnt){
    let maxDisplayedBadges=determineMaxBadges(); //need to make this dynamic

    let badgelocation=document.getElementById('badges');
    badgelocation.innerHTML='';

    let badgesPrinted=badgesCnt<maxDisplayedBadges ? badgesCnt : maxDisplayedBadges; //determining number of badges to display
    for(let i=0; i<badgesPrinted; i++){ //adding badges to top of profile
        const badge=document.createElement('img');
        badge.src='../../badge.png';
        badgelocation.appendChild(badge);
    }
    if(badgesCnt>maxDisplayedBadges){ //print an integer if the user has more then 23 badges since thats how many can
        let badgeRemainder=badgesCnt-maxDisplayedBadges;
        const additionalBadges=document.createElement('span');
        additionalBadges.textContent=`+${badgeRemainder}`;
        badgelocation.appendChild(additionalBadges);
    }
}

export function populateFriendsList(friendsCnt, friends){
    const friendsListContent=document.getElementById('friendsListContent');
    friendsListContent.innerHTML=''; //this wipes the existing drop down content

    //this actually populates the drop down
    for(let i=0; i<friendsCnt; i++){
        const friend=document.createElement('a');
        friend.href='../../searchedProfile/searchProfileIndex.html'; //link to a friends page, iterate thru database
        friend.textContent=friends[i]; //switch to the friends user name

        friend.addEventListener('click', function(event){
            event.preventDefault();
            const user=this.textContent;
            const url=`http://127.0.0.1:5000/data/${user}`;
            console.log(url);

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({username:user})
            })
            .then(response=>{
                if(!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data=>{
                if(data.message){
                    localStorage.setItem('searchUserName', user);
                    localStorage.setItem('searchUserID', data.userID);
                    window.location.href='../../searchedProfile/searchProfileIndex.html';
                } else{
                    console.log('User not found: ', data.error);
                }
            })
            .catch(error=>{
                console.error('Error: ', error);
            })
        })
        friendsListContent.appendChild(friend);
    }
}