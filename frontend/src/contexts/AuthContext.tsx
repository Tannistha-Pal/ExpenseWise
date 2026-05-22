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
  isAuthReady: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    // Try to restore session from token, validate with backend
    const init = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsAuthReady(true);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Session invalid");
        const { user } = await res.json();
        // Normalize _id to id if needed
        const normalized = {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar || "",
          createdAt: user.createdAt,
        };
        localStorage.setItem("user_data", JSON.stringify(normalized));
        setUser(normalized as User);
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
      const res = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Signup failed:", errorData.error);
        return false;
      }

      const { user, token } = await res.json();
      if (!token) throw new Error("No token returned from server");

      const normalized = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || "",
        createdAt: user.createdAt,
      };

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(normalized));
      setIsAuthenticated(true);
      setUser(normalized as User);

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Login failed:", errorData.error);
        return false;
      }

      const { user, token } = await res.json();
      if (!token) throw new Error("No token returned from server");

      const normalized = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || "",
        createdAt: user.createdAt,
      };

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(normalized));
      setIsAuthenticated(true);
      setUser(normalized as User);
      
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

    const hasAvatarOnly = data.avatar !== undefined && data.name === undefined && data.email === undefined && data.phone === undefined;
    if (hasAvatarOnly) {
      const normalized = {
        ...user,
        avatar: data.avatar,
      };
      setUser(normalized as User);
      localStorage.setItem("user_data", JSON.stringify(normalized));
      return true;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://localhost:8000/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: data.name ?? user.name,
          email: data.email ?? user.email,
          phone: data.phone ?? user.phone,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Profile update failed:", errorData.error);
        return false;
      }
      const { user: updatedUser } = await res.json();
      const normalized = {
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar || "",
        createdAt: updatedUser.createdAt,
      };
      setUser(normalized as User);
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
      const res = await fetch("http://localhost:8000/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Change password failed:", errorData.error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  // Helper: return headers including Authorization when token is present
  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

