// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
    sub: string;
    tenant_id: string;
    exp: number; // Expiration timestamp
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserPayload | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // You could also trigger a TanStack Query cache invalidation here
    };

    const validateAndSetUser = (token: string | null) => {
        if (!token) return logout();

        try {
            const decoded = jwtDecode<UserPayload>(token);
            const isExpired = decoded.exp * 1000 < Date.now();

            if (isExpired) {
                logout();
            } else {

                console.log("DECODED", decoded)
                setUser(decoded);
            }
        } catch (error) {
            // "Naughty user" check: If decoding fails (tampered string), kick them out
            logout();
        }
    };

    useEffect(() => {
        // Check on an initial load
        const token = localStorage.getItem('token');
        validateAndSetUser(token);
        setIsLoading(false);

        // Monitor storage changes (if they delete the token in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') validateAndSetUser(e.newValue);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        validateAndSetUser(token);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};