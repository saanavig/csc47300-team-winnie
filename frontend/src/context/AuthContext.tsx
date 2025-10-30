import * as jwt_decode from "jwt-decode";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface DecodedToken {
    sub?: {
        username?: string;
        email?: string;
        name?: string;
    };
    exp?: number;
    }

    interface AuthContextType {
    username: string | null;
    setUsername: (name: string | null) => void;
    logout: () => void;
    }

    const AuthContext = createContext<AuthContextType>({
    username: null,
    setUsername: () => {},
    logout: () => {},
    });

    export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
        try {
            const decoded: DecodedToken = jwt_decode.jwtDecode(token);
            if (decoded.sub?.name || decoded.sub?.username) {
            setUsername(decoded.sub.name || decoded.sub.username || null);
            }
        } catch {
            console.warn("Invalid token");
        }
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ username, setUsername, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
