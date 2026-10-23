import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetCurrentUser } from "@workspace/api-client-react";
import type { UserProfile } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string, userData: UserProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("mp_token"));
  const [localUser, setLocalUser] = useState<UserProfile | null>(null);
  const [, setLocation] = useLocation();

  // Try to fetch user if we have a token
  const { data: serverUser, isLoading: isQueryLoading, isError } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      // Token is invalid
      logout();
    }
  }, [isError]);

  const user = serverUser || localUser;
  const isLoading = !!token && isQueryLoading && !localUser;

  const login = (newToken: string, userData: UserProfile) => {
    localStorage.setItem("mp_token", newToken);
    setToken(newToken);
    setLocalUser(userData);
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("mp_token");
    setToken(null);
    setLocalUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
