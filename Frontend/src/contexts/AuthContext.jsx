import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext(undefined);

// Create the Provider component
export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so the session survives a page refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('as-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, token) => {
    setUser(userData);
    // Save user data and token for persistence
    localStorage.setItem('as-user', JSON.stringify(userData));
    localStorage.setItem('token', token); 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('as-user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};