import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ role, children }) {
  // Using 'useAuth' to match our context file. 
  // Defaulting loading to false since our current localStorage auth is synchronous!
  const { user, loading = false } = useAuth();

  if (loading) {
    return (
      <div className="as-spinner-container">
        <div className="as-spinner"></div>
      </div>
    );
  }

  // If no user is found, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required (like "artisan") and the user doesn't match
  if (role && user.role !== role) {
    return <Navigate to="/" replace />; // Redirecting unauthorized users to home instead of login is usually safer
  }

  return children;
}