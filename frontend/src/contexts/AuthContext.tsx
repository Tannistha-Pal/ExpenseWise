import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Auto-login for demo purposes
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user_data");
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    } else {
      // Create demo user for immediate access
      const demoUser: User = {
        id: "demo-user",
        name: "Demo User",
        email: "demo@expensewise.com",
        phone: "+1234567890",
        createdAt: new Date().toISOString()
      };
      
      const demoToken = btoa(`${demoUser.email}:${Date.now()}`);
      localStorage.setItem("auth_token", demoToken);
      localStorage.setItem("user_data", JSON.stringify(demoUser));
      setIsAuthenticated(true);
      setUser(demoUser);
    }
  }, []);

  // Simple password hashing function (in production, use bcrypt or similar)
  const hashPassword = (password: string): string => {
    return btoa(password + "salt"); // Simple hashing for demo
  };

  const verifyPassword = (password: string, hashedPassword: string): boolean => {
    return hashPassword(password) === hashedPassword;
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Signup failed:", errorData.error);
        return false;
      }

      const { user } = await res.json();

      // Auto-login after signup
      const token = btoa(`${email}:${Date.now()}`);
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(user));
      setIsAuthenticated(true);
      setUser(user);

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Login failed:", errorData.error);
        return false;
      }

      const { user } = await res.json();

      // Create session token
      const token = btoa(`${email}:${Date.now()}`);
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(user));
      
      setIsAuthenticated(true);
      setUser(user);
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      
      // Update user in users array
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u: any) => u.email === user.email);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...data };
        localStorage.setItem("users", JSON.stringify(users));
      }
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userData = users.find((u: any) => u.email === user.email);

      if (!userData || !verifyPassword(currentPassword, userData.password)) {
        return false;
      }

      // Update password
      userData.password = hashPassword(newPassword);
      localStorage.setItem("users", JSON.stringify(users));
      
      return true;
    } catch (error) {
      console.error("Password change error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      signup, 
      logout, 
      updateProfile, 
      changePassword 
    }}>
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
