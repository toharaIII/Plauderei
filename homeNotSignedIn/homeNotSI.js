//ensures all functions inside the DOM will run once page is fully loaded
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
                console.log('User found:', data.message);
                console.log('Searched User ID:', data.userID);
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

    signInSubmit.addEventListener('click', function(){
        const username=document.getElementById('emailUser').value;
        const password=document.getElementById('emailUserPassword').value;

        const data={
            username: username,
            password: password
        };

        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.success){
                localStorage.setItem('userID', data.userID);
                window.location.href='../../homeSignedIn/homeSIIndex.html';
            }else alert(data.error || 'Invalid username or password. Please try again.');
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occured while trying to log in. Please try again later.')
        });
    });

    document.addEventListener('click', function(event){
        if(!signInPopUp.contains(event.target) && event.target!==signInPopUp){
            signInPopUp.classList.remove('show');
        }
    });

    createAccount.addEventListener('click', function(event){
        event.stopPropagation();
        createAccountPopUp.classList.add('show');
    });

    createAccountSubmit.addEventListener('click', function(){
        const username=document.getElementById('newUser').value;
        const password=document.getElementById('newUserPassword').value;
        const now=new Date().toISOString();
    
        const data={
            username: username,
            password: password,
            dateJoined: now
        };
    
        fetch('http://127.0.0.1:5000/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response=>{
            if(!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data=>{
            if(data.success) window.location.href = '../../homeSignedIn/homeSIIndex.html';
            else alert(data.error || 'Failed to create account. Please try again.');
        })
        .catch((error)=>{
            console.error('Error:', error);
            alert('An error occurred while trying to create your account. Please try again later.');
        });
    });

    document.addEventListener('click', function(event){
        if(!createAccountPopUp.contains(event.target) && event.target!==createAccountPopUp){
            createAccountPopUp.classList.remove('show');
        }
    });
});