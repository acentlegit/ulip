import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Session timeout detection
  useEffect(() => {
    if (!user || !token) return;

    let inactivityTimer;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        // Session expired - redirect to session timeout page
        localStorage.setItem("sessionExpired", "true");
        window.location.href = "/session-timeout";
      }, SESSION_TIMEOUT);
    };

    // Reset timer on user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [user, token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me");
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Only logout if it's an auth error, not a server error
      if (error.response?.status === 401) {
        // Check if session expired
        if (localStorage.getItem("sessionExpired")) {
          window.location.href = "/session-timeout";
        } else {
          logout();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      if (!role) {
        return {
          success: false,
          error: "Role is required"
        };
      }
      
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        role
      });
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed"
      };
    }
  };

  const register = async (email, password, name, organizationName, role) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
        name,
        organizationName,
        role
      });
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          "Registration failed. Please check if the backend server is running and the database is set up.";
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const ssoLogin = async (token, userData) => {
    try {
      // Set token first
      localStorage.setItem("token", token);
      setToken(token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Set user data immediately
      if (userData) {
        setUser(userData);
      } else {
        // If userData not provided, fetch it
        await fetchUser();
      }
      
      // Ensure loading is false so ProtectedRoute doesn't block
      setLoading(false);
      
      return { success: true };
    } catch (error) {
      console.error("SSO login error:", error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, ssoLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
