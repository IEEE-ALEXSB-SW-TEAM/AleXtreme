import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');
        
        if (adminToken) {
            setIsLoggedIn(true);
            setUserRole('admin');
        } else if (token) {
            setIsLoggedIn(true);
            setUserRole('contestant');
        }
    }, []);

    const login = (role = 'contestant') => {
        setIsLoggedIn(true);
        setUserRole(role);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};
