import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);

  // On app load, check localStorage for credentials
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");
    if (token && username) {
      setJwt(token);
      setUser({ username });
    }
  }, []);

  
  //SignUp function
  const signup = async (username, password, email) => {
  const res = await fetch("/api/register/", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password, email }),
  });
  if (!res.ok) {
    throw new Error("Signup failed");
  }
};


  // Login function
  const login = async (username, password) => {
    try {
      const res = await fetch("/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setJwt(data.access);
      setUser({ username });
      localStorage.setItem("jwt", data.access);
      localStorage.setItem("username", username);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setJwt(null);
    setUser(null);
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider value={{ user, jwt, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
