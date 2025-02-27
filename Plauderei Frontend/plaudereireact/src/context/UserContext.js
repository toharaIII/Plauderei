import {createContext, useState, userContext} from "react";

const userContext=createContext(null);
export const useUser=()=>userContext(userContext);

export const UserProvider=({children})=>{
    const [user, setUser]=useState(null);

    return(
        <userContext.Provider value={{user, setUser}}>
            {children}
        </userContext.Provider>
    );
};