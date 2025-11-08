import { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = (data) => {
    try {
      if (!data || !data.token || !data.user) {
        throw new Error("Invalid login response");
      }

      const { token: t, user: u } = data;

      // Basic validation for required user fields
      if (!u.id || !u.name || !u.email || !u.role) {
        throw new Error("Incomplete user data received from server");
      }

      setToken(t);
      setUser(u);
      localStorage.setItem("token", t);
      localStorage.setItem("user", JSON.stringify(u));

      toast.success(`Welcome back, ${u.name}!`);
    } catch (err) {
      console.error("Auth login error:", err);
      toast.error(err.message || "Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
