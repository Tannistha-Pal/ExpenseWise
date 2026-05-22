import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_URL = "http://localhost:8000";

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
  isAuthReady: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(raw: any): User {
  return {
    id: raw._id || raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    avatar: raw.avatar || "",
    createdAt: raw.createdAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsAuthReady(true);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Session invalid");
        const body = await res.json();
        const normalized = normalizeUser(body?.data?.user || body?.user);
        localStorage.setItem("user_data", JSON.stringify(normalized));
        setUser(normalized);
        setIsAuthenticated(true);
      } catch (err) {
        console.warn("Session restore failed:", err);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsAuthReady(true);
      }
    };
    init();
  }, []);

  const signup = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        console.error("Signup failed:", body.error || body.message);
        return false;
      }

      const token = body?.data?.token || body?.token;
      const normalized = normalizeUser(body?.data?.user || body?.user);
      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(normalized));
      setIsAuthenticated(true);
      setUser(normalized);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const body = await res.json();
      if (!res.ok) {
        console.error("Login failed:", body.error || body.message);
        return false;
      }

      const token = body?.data?.token || body?.token;
      const normalized = normalizeUser(body?.data?.user || body?.user);
      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(normalized));
      setIsAuthenticated(true);
      setUser(normalized);
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

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: data.name ?? user.name,
          email: data.email ?? user.email,
          phone: data.phone ?? user.phone,
          avatar: data.avatar ?? user.avatar ?? "",
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        console.error("Profile update failed:", body.error || body.message);
        return false;
      }

      const normalized = normalizeUser(body?.data?.user || body?.user);
      setUser(normalized);
      localStorage.setItem("user_data", JSON.stringify(normalized));
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json();
      if (!res.ok) {
        console.error("Change password failed:", body.error || body.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAuthReady,
      user,
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
