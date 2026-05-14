import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('sv_token');
        const email = localStorage.getItem('sv_user');
        return (token && email) ? { email } : null;
    });
    const navigate = useNavigate();

    const login = (email, token) => {
        localStorage.setItem('sv_token', token);
        localStorage.setItem('sv_user', email);
        setUser({ email });
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('sv_token');
        localStorage.removeItem('sv_user');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
