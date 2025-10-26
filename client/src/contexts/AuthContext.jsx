import { createContext, useContext, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = () => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setErrors([]);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role || (data.isOrganizer ? "organizer" : "attendee"),
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        return { success: true, user: userData };
      } else {
        if (data.errors) setErrors(data.errors);
        return { success: false, errors: data.errors || [{ message: data.message || "Login failed" }] };
      }
    } catch (error) {
      console.error("Login error:", error);
      const networkError = [{ message: "Network error. Please try again." }];
      setErrors(networkError);
      return { success: false, errors: networkError };
    }
  };

  const signup = async (userData) => {
    setErrors([]);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: "Account created successfully" };
      } else {
        if (data.errors) setErrors(data.errors);
        return { success: false, errors: data.errors || [{ message: data.message || "Signup failed" }] };
      }
    } catch (error) {
      console.error("Signup error:", error);
      const networkError = [{ message: "Network error. Please try again." }];
      setErrors(networkError);
      return { success: false, errors: networkError };
    }
  };

  const logout = async () => {
    setErrors([]);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const verifySession = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-session`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    loading,
    errors,
    login,
    signup,
    logout,
    verifySession,
    isAuthenticated: !!user,
    isOrganizer: user?.role === "organizer",
    isAttendee: user?.role === "attendee",
    clearErrors: () => setErrors([]),
  };

  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
