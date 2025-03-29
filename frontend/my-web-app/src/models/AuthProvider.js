import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const AuthContext = createContext();

// Custom hook for easier access
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token")); 
    const [userId, setUserId] = useState(localStorage.getItem("userId"));

    // Function to login and store token/userId
    const login = (newToken, newUserId) => {
        setToken(newToken);
        setUserId(newUserId);
        localStorage.setItem("token", newToken); 
        localStorage.setItem("userId", newUserId); 
    };

    // Function to logout and clear auth data
    const logout = () => {
        setToken(null);
        setUserId(null);
        localStorage.removeItem("token"); 
        localStorage.removeItem("userId");
    };

     // Function to decode JWT and check expiry
     const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
            return payload.exp * 1000 < Date.now(); // Check if token has expired
        } catch (error) {
            return true; // Assume expired if decoding fails
        }
    };

   // Effect to check if token is still valid on app reload
   useEffect(() => {
    if (!token || !userId || isTokenExpired(token)) {
        logout(); // If no token or expired token, logout the user
    } else {
        // Validate token with backend
        const validateToken = async () => {
            try {
                const response = await fetch(`/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    logout(); // If API validation fails, logout
                }
            } catch (error) {
                logout(); // Handle network errors
            }
        };

        validateToken();
    }
}, [token, userId]);

    return (
        <AuthContext.Provider value={{ token, userId, login, logout, isTokenExpired }}>
            {children}
        </AuthContext.Provider>
    );
};
