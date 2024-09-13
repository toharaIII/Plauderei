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

export function profileMenu(event){
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

function populatePopUp(answers, userID, signedInBoolean){
    const popup=document.getElementById('popupContent');
    popup.innerHTML='<p>responses</p>';

    answers.forEach(answer => {
        const {submission, parentID}=answer;
        const answerItem=document.createElement('div');
        answerItem.textContent=submission;
        answerItem.classList.add('answer');
        popup.appendChild(answerItem);

        if(signedInBoolean){ //maybe dry below and make a seperate function for user replys
            answerItem.addEventListener('click', function () {
                let existingTextarea=popup.querySelector('textarea');
                if (existingTextarea) existingTextarea.remove();

                const textarea=document.createElement('textarea');
                textarea.placeholder='Type your response here and press Enter...';
                textarea.classList.add('responseEntry');
                popup.insertBefore(textarea, answerItem.nextSibling);
                popup.style.display='flex';
                popup.style.flexDirection='column';

                textarea.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();

                        const submission=textarea.value.trim();
                        if (submission) {
                            const data = {
                                submission: submission,
                                parentID: parentID
                            };

                            fetch(`http://127.0.0.1:5000/submissions/${userID}`, {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                                body: JSON.stringify(data)
                            })
                            .then(response => {
                                if (!response.ok) throw new Error('Network response was not ok');
                                return response.json();
                            })
                            .then(data => {
                                if (data.error) console.error(data.error);
                                else {
                                    console.log('Response submitted successfully:', data.message);
                                    textarea.remove(); 
                                }
                            })
                            .catch(error => {
                                console.error('Error submitting the response:', error);
                            });
                        }
                    }
                });
            });
        }
    });
}

export function getPopUpAnswers(userID=0, signedInBoolean){
    const url='http://127.0.0.1:5000/submissions';

    fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, 
    })
    .then(response=>{
        if(!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data=>{
        if(data.error) console.log(data.error || 'you dont seem to exist? Thats weird :|');
        else{
            console.log('booya :P');
            const answers=data.map(row=>({submission: row[2], parentID: row[0]}));
            populatePopUp(answers, userID, signedInBoolean);
        }
    });
}

function getReplys(parentID){
    const existingReplysDisplay = document.querySelector('.replysDisplay');
    if (existingReplysDisplay) {
        existingReplysDisplay.remove();
        document.querySelector('.todaysAnswer').classList.remove('replys');
        document.removeEventListener('click', handleClickOutside);
        return;
    }

    const url=`http://127.0.0.1:5000/submissions/${parentID}`;
    fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json()
    })
    .then(data => {
        const replysDisplay=document.createElement('div');
        replysDisplay.className='replysDisplay';

        if (data.error) replysDisplay.textContent="No replys yet!";
        else {
            console.log('replys retrieved:', data);
            if (Array.isArray(data.replys)) {
                data.forEach(row => {
                    const replyUserName=document.createElement('div');
                    replyUserName.textContent=row.userName;
                    replysDisplay.appendChild(replyUserName);
                    const replyDiv=document.createElement('div');
                    replyDiv.textContent=row.submission;
                    replysDisplay.appendChild(replyDiv);
                });
            } else if(typeof data==='object'){
                const replyDiv=document.createElement('div');
                replyDiv.textContent=data.submission;
                replysDisplay.appendChild(replyDiv);
            }
            const userAnswer=document.querySelector('.todaysAnswer');
            userAnswer.insertAdjacentElement('afterend', replysDisplay);
            userAnswer.classList.add('replys');
            document.addEventListener('click', handleClickOutside);
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function handleClickOutside(event) { //prob want to dry this so we can use it for general replys
    const userAnswer=document.querySelector('.todaysAnswer');
    const replysDisplay=document.querySelector('.replysDisplay');
    
    if (replysDisplay && !userAnswer.contains(event.target) && !replysDisplay.contains(event.target)) {
        replysDisplay.remove();
        document.removeEventListener('click', handleClickOutside); 
        console.log("RepliesDisplay removed");
    }
}

function pinButtonFunctionality(answerText){
    const pinButton=document.createElement('button');
    pinButton.className='pinButton';
    const pin=document.createElement('img');
    pin.src='../../pin.png';
    pin.id="pin";
    pinButton.appendChild(pin);
    userAnswer.appendChild(pinButton);
    pinButton.addEventListener('click', updatePinned(answerText));
}

export function getTodaysAnswer(userID, myProfile){
    const url=`http://127.0.0.1:5000/submissions/${userID}`;
    fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json()
    })
    .then(data => {
        console.log(userID);
        if (data.error) console.error(data.error)
        else {
            console.log('Answer retrieved:', data);
            const userAnswer=document.createElement('div');
            userAnswer.className='todaysAnswer';

            if(myProfile) pinButtonFunctionality(data.submission);

            const paragraph=document.createElement('p');
            paragraph.textContent='Todays Answer:';
            userAnswer.appendChild(paragraph);
            const answerText=document.createElement('div');
            answerText.className='answerText';
            answerText.textContent=data.submission;
            userAnswer.appendChild(answerText);

            const replyButton=document.createElement('button');
            replyButton.className='replyButton';
            replyButton.textContent='replys';
            userAnswer.appendChild(replyButton);
            replyButton.addEventListener('click', function(){
                console.log("reply button clicked");
                getReplys(data.id);
            });

            const questionsDiv=document.getElementById('questions');
            questionsDiv.insertAdjacentElement('afterend', userAnswer);
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}