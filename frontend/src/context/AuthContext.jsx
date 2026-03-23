import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        const { token, user } = JSON.parse(saved);
        setToken(token);
        setUser(user);
      } catch (_) {
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth", JSON.stringify({ token: data.token, user: data.user }));
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth");
  }, []);

  const authFetch = useCallback(
    (url, options = {}) =>
      fetch(`${API}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }),
    [token]
  );

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}   