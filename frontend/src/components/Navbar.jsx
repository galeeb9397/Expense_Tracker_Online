import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import {navbarStyles} from '../assets/dummyStyles';
import imgl from '../assets/logo.png'
import axios from 'axios';


const BASE_URL = `${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000" : "https://expense-tracker-online-k6kc.onrender.com")}/api`;



const Navbar =({user: propUser, onLogout})=>{   
    const navigate=useNavigate();
    const menuRef=useRef();
    const [menuOpen,setMenuOpen]=useState(false);
    const [localUser, setLocalUser]=useState(null);

    const user=propUser || localUser || {
        name:"",
        email:"",
    };

// to fetch the user data from server
useEffect(()=>{
    const fetchUserData=async()=>{
        try{
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if(!token){
                
                return;
            }
            const response=await axios.get(`${BASE_URL}/users/me`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const userData=response.data.user || response.data;
            setLocalUser(userData); // Update the user state with the fetched data
            // Handle the response as needed
        }catch(error){
            console.error("Error fetching user data:", error);
        }
    };
    if(!propUser){
        fetchUserData();
    }
},[propUser]);


    const toggleMenu=()=>setMenuOpen((prev)=>!prev);

const handleLogout=()=>{
    setMenuOpen(false);
    localStorage.removeItem("token");
    onLogout?.();
    navigate("/login");
};
useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
    return (
       <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                {/* logo */}
                <div onClick={()=> navigate("/")}
                 className={navbarStyles.logoContainer}
                 >
                
                    <div className={navbarStyles.logoImage}>
                        <img src={imgl} alt="logo" />
                    </div>
                    <span className={navbarStyles.logoText}>Expense Tracker</span>

                    

                </div>

                {/* if the user is present */}

                {user&&(

                    <div className={navbarStyles.userContainer} ref={menuRef}>
                        <button onClick={toggleMenu} className={navbarStyles.userButton}>
                            <div className="relative">
                                <div className={navbarStyles.userAvatar}>
                                    {user?.name?.[0]?.toUpperCase()||"U"}

                                </div>
                                <div className={navbarStyles.statusIndicator}></div>
                                </div> 
                               <div className={navbarStyles.userTextContainer}>
                                    <p className={navbarStyles.userName}>{user?.name||"User"}</p>
                                    <p className={navbarStyles.userEmail}>{user?.email||"user@expensetracker.com"}</p>

                                   


                                </div> 

                                <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />


                            
                        </button>
                        {/* dropdown menu */   }
                        {menuOpen && (
                            <div className={navbarStyles.dropdownMenu}>
                                <div className={navbarStyles.dropdownHeader}>

                                    <div className="flex items-center gap-3">
                                        <div className={navbarStyles.dropdownAvatar}>
                                            {user?.name?.[0]?.toUpperCase()||"U"}
                                        </div>
                                        <div>
                                            <div className={navbarStyles.dropdownName}>{user?.name||"User"}</div>
                                            <div className={navbarStyles.dropdownEmail}>{user?.email||"user@expensetracker.com"}</div>
                                            
                                        </div>

                                    </div>

                                </div>
                                <div className={navbarStyles.menuItemContainer}>
                                    <button 
                                    onClick={()=>{
                                        setMenuOpen(false);
                                        navigate("/profile");

                                    }}
                                    className={navbarStyles.menuItem}
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Profile</span>
                                    </button>
                                </div>
                                <div className={navbarStyles.menuItemBorder}>
                                    <button onClick={onLogout} className={navbarStyles.logooutButton}>
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>

                            </div>
                        )}

                    </div>
                )}

            </div>

       </header>
    )
}
export default Navbar