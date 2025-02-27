import { useUser } from "../context/UserContext";

const Profile=()=>{
    const {user}=useUser();

    if(!user) return <p>Please log in</p>;
    return (
        <div>
            <h2>Welcome, {user.username}!</h2>
            <p>Email: {user.email}</p>
        </div>
    );
};

export default Profile;