import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // Load token & user on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  // Login
  const login = (accessToken, userData) => {
    const formattedUser = {
      id: userData.id || userData.user_id,
      username: userData.username,
    };

    console.log("✅ Saving user in context:", formattedUser);

    setToken(accessToken);
    setUser(formattedUser);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(formattedUser));
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
