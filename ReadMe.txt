schedule:
    feb 20: database
    feb 21: api
    feb 22: api testing on postman + debug
    feb 23: Backend + unit testing + debug
    feb 24: FrontEnd main page, both
    feb 25: frontend my profile + other profile
    feb 26: froentend admin page + make unit testing
    feb 27: debug if necessary
    feb 28: integration testing

DataBase:
MySQL:
user: email (unique), password, UUID, username, friendslist map<username, UUID>, 
    submission 


CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL, -- Links the comment to a post/video
    user_id INT NOT NULL, -- Links to the user who made the comment
    parent_id INT NULL, -- References another comment (NULL if it's a top-level comment)
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DailyQuestion Queue:
    string for question, questionId, position?

submittedQuestions
    string for question, questionId, UUID (for user), timeSubmitted


Backend:
user object{
    email
    password
    UUID
    username
    bio
    friendslist map<username, UUID>
    pinnedAnswers map<questionId,
    numAnswers
    curSubmissionID? look into below chatgpt thread
}

not sure how to handle comments, look at chatgpt thread called: nested comments implimentation

Middeware:
create user

Get userObeject from email
Get userObject from UUID
Get dailyQuestion
Get comment + thread
Get allDailyQuestionQueue
Get allSubmittedQuestionsTime

Send newUsername
Send newFriendsList
Send pinnedAnswers
Send numAnswers
Send curSubmission
Send submittedQuestions
Send pinnedAnswers
Send newReply

FrontEnd:
Not SignedIn main:
    daily question
    random nested answers + thread
    menu with: sign in, create account, search user

signed in main:
    daily question
    my answer with thread or prompt to write answer
    nested answers with threads
    answer threads of friends
    menu with: sign out, search user, my profile, admin if applicable
    number of answers stacked up
    number of replies until new answer

my profile:
    username
    UUID
    bio
    friendslist
    submitted questions for daily question + option to remove
    sticker for each question used as the daily
    pinned answers
    current answer + option to add to current answer to pinned answers/ remove one of existing if necessary
    submit question for daily question consideration
    view replies to answer
    view replies to user replies
    settings to change username, bio, password
    menu: main page, sign out, search, admin if applicable

other profile:
    username
    UUID
    bio
    friendslist
    add friend/remove friend
    current answer if one + replies
    pinned answers
    menu: main page, sign out, search, my profile, admin if applicable

admin page
    menu: menu: main page, sign out, search, my profile
    daily question queue
    submitted questions with criteria like time submitted, etc?
    add to bottom of queue from submittedQuestions
    remove from queue