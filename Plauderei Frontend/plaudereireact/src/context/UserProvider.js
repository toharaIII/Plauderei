import {createContext, useState, useContext} from "react";

const UserContext=createContext(null);
export const useUser = () => useContext(UserContext);

export const UserProvider=({children})=>{
    const [user, setUser]=useState(null);

    const login=async(identifier, password)=>{
        try{
            const response=await fetch("http://127.0.0.1:8000/user/login/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({identifier, password}),
            });

            if(!response.ok){
                throw new Error("Invalid credentials");
            }

            const userData=await response.json();
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        } catch(error){
            console.error("Login failed:", error)
        }
    };

    const logout=()=>{
        setUser(null);
        localStorage.removeItem("user");
    };

    return(
        <UserContext.Provider value={{user, login, logout}}>
            {children}
        </UserContext.Provider>
    );
};