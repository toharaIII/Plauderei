document.addEventListener('DOMContentLoaded', function() {
    let userAnswers=0;
    let userResponses=0;

    //let userId=localStorage.getItem('userID');
    let userId=1;
    let badgesCnt=0;
    let userName="";
    let name="";
    let dateJoined="";
    let userEntry="";
    let friendCnt=0;
    let friends=[];
    let pinnedAnswers=[];
    let submittedQuestionsArray=[];

    //need populate for username, name, join date, bio, friends list, submitted questions, pinned answers, answer total, responses remaining and badges
    //need to patch call for settings shit to change name and bio, and for submit questions
    //need to add the search shit

    function updateUI(){
        document.getElementById("userName").textContent=userName;
        document.getElementById("name").textContent=name;
        document.getElementById("dateJoined").textContent=dateJoined;
        document.getElementById("userEntry").textContent=userEntry;
        document.getElementById("answerCnt").textContent=userAnswers;
        document.getElementById("responseCnt").textContent=userResponses;
    }

    function populatePage(){
        const url=`http://127.0.0.1:5000/data/${userId}`;
        console.log(url);

        fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.dateJoined) console.log('booya :P')
            else console.log(data.error || 'This User Doesnt seem to exist? Thats weird :|');
            userName=data.username;
            name=data.name || 'No Name';
            dateJoined=data.dateJoined;
            userEntry=data.bio || 'No Bio';
            badgesCnt=data.badges;
            friends=Array.isArray(data.friendsList) ? data.friendsList : (data.friendsList ? JSON.parse(data.friendsList) : []);
            friendCnt=friends.length;
            pinnedAnswers=Array.isArray(data.pinnedAnswers) ? data.pinnedAnswers : (data.pinnedAnswers ? JSON.parse(data.pinnedAnswers) : []);
            submittedQuestionsArray = Array.isArray(data.submittedQuestions) ? data.submittedQuestions : (data.submittedQuestions ? JSON.parse(data.submittedQuestions) : []);
            updateUI();
            populateBadges(badgesCnt);
            populateFriendsList(friendCnt);
            populateSubmittedQuestions(submittedQuestionsArray);
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to find this user. Please try again later.');
        });
    }
    populatePage();

    document.getElementById('menuIcon').addEventListener('click', function(){
        this.classList.toggle('change');
        const menuElement=document.getElementById('menu');
        const menuQuestionLine=document.querySelector('.menuQuestionLine');
        const questionDiv=document.querySelector('.question');

        //to toggle menu visibility
        menuElement.classList.toggle('show');
    });

    searchSubmit.addEventListener('click', function(){
        const url='http://127.0.0.1:5000/users/search';
        user=document.getElementById('userSearch').value;

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
            if(data.success) {
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
    });

    document.getElementById('changeName').addEventListener('keypress', function(event) {
        if (event.key==='Enter') {
            newName=event.target.value;
            const url=`http://127.0.0.1:5000/users/${userId}`;
            const data={name: newName};

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
                if(data.message) alert('booya :P')
                else alert(data.error || 'cant add to the list?');
                location.reload();
            })
            .catch((error)=>{
                console.error('Error:', error);
                alert('An error occured while trying to submit this Name. Please try again later.');
            });
        }
    });

    document.getElementById('changeBio').addEventListener('keypress', function(event) {
        if (event.key==='Enter') {
            userEntry=event.target.value;
            const url=`http://127.0.0.1:5000/users/${userId}`;
            const data={bio: userEntry};

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
                if(data.message) alert('booya :P')
                else alert(data.error || 'cant add to the list?');
                location.reload();
            })
            .catch((error)=>{
                console.error('Error:', error);
                alert('An error occured while trying to submit this Bio. Please try again later.');
            });
        }
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

    document.querySelector('.settingsButton').addEventListener('click', function(){
        const settingsContent=document.getElementById('settingsContent');
        settingsContent.style.display=settingsContent.style.display==='flex'?'none':'flex'; //cool different way of doing this, seems better then including a .show/.hide, switch all to this
    });

    function populateFriendsList(friendsCnt){
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
                    if(data.success){
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
    };
    populateFriendsList(friendCnt);
    document.querySelector('.showFriendsList').addEventListener('click', function(){
        const friendsListContent=document.getElementById('friendsListContent');
        friendsListContent.style.display=friendsListContent.style.display==='flex'?'none':'flex'; //cool different way of doing this, seems better then including a .show/.hide, switch all to this
    });

    enterQuestion=document.getElementById('submitQuestion');
    function submitQuestionFromTextarea(submittedQuestionsArray){
        questionTextarea=document.getElementById('userQuestion');
        question=questionTextarea.value
        submittedQuestionsArray.push(questionTextarea.value);
        populateSubmittedQuestions(submittedQuestionsArray);

        const url=`http://127.0.0.1:5000/users/${userId}`;
        const data={submittedQuestions: [question]};

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
            if(data.message) alert('booya :P')
            else alert(data.error || 'cant add to the list?');
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to submit this question. Please try again later.');
        });
        questionTextarea.value='';
    };
    enterQuestion.addEventListener('click', function(){
        submitQuestionFromTextarea(submittedQuestionsArray);
    });

    function populateSubmittedQuestions(submittedQuestionsArray){
        const submittedQuestionsContent=document.getElementById('submittedQuestionsContent');
        submittedQuestionsContent.innerHTML='';

        for(let i=submittedQuestionsArray.length-1; i>=0; i--){
            const question=document.createElement('div');
            question.textContent=submittedQuestionsArray[i];
            submittedQuestionsContent.appendChild(question);
        }
    };
    populateSubmittedQuestions(submittedQuestionsArray);
    document.querySelector('.showSubmittedQuestions').addEventListener('click', function(){
        const submittedQuestionsContent=document.getElementById('submittedQuestionsContent');
        submittedQuestionsContent.style.display=submittedQuestionsContent.style.display==='flex'?'none':'flex';
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