"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "@/types/user";

interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  
  // Authentication actions (UI-only simulation)
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  
  // Loading states
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock role data for UI simulation
const mockAdminRole: UserRole = {
  id: "cldefault_admin",
  name: "ADMIN",
  description: "Administrator with full system access",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock user data for UI simulation
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  roleId: "cldefault_admin",
  role: mockAdminRole,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export function AuthProvider({ children }: AuthProviderProps) {
  // For demo purposes, start as authenticated. In real app, this would check localStorage/cookies
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<User | null>(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation for demo (accept any email/password)
    if (email && password) {
      setIsAuthenticated(true);
      setUser(mockUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation for demo
    if (name && email && password) {
      const mockUserRole: UserRole = {
        id: "cldefault_user",
        name: "USER",
        description: "Standard user with basic permissions",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newUser: User = {
        id: "2",
        name,
        email,
        roleId: "cldefault_user",
        role: mockUserRole,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setIsAuthenticated(true);
      setUser(newUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    signup,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}