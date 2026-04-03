// src/components/AuthGuards.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PROTECTED ROUTE
 * Use this for any page that requires a login.
 * If not logged in, redirects to the Login page ("/").
 */
export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // Show a loading spinner so the app doesn't "flicker" while checking the token
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        );
    }

    // If authenticated, render the child routes (Outlet)
    // If NOT, send them to login and save where they were trying to go (location)
    return isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to="/" state={{ from: location }} replace />
    );
};

/**
 * PUBLIC ROUTE
 * Use this for the Login/Signup pages.
 * If the user IS already logged in, it bounces them away to their dashboard.
 */
export const PublicRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) return null;

    // If user is already logged in, don't show the login page!
    // Redirect them based on their role (admin or school)
    if (isAuthenticated) {
        console.log("From public route ++++++++++++++++++++++++", user);
        const defaultPath = user?.tenant_id === 'sn_network' ? '/admin' : '/school';
        return <Navigate to={defaultPath} replace />;
    }

    // If not logged in, show the Login page (Outlet)
    return <Outlet />;
};