import { createContext, useContext, useState, useEffect } from "react";
import { controlerDeviceApi, getMeApi, updateThresholdApi } from "../services/auth.service";
import { socket } from "../socket.js";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await getMeApi();
          setUser(response.user);
        } catch (error) {
          console.error("Auth check failed:", error);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    socket.connect();
    console.log("🟢 Socket connected");

    socket.on("device:update", ({ type, state }) => {
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, [type]: state };
      });
    });

    socket.on("threshold:update", (payload) => {
      console.log("📡 Threshold realtime update:", payload);

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...payload,
        };
      });
    });

    return () => {
      socket.off("device:update");
      socket.off("threshold:update");
      socket.disconnect();
    };
  }, []);

useEffect(() => {
  socket.connect();
  console.log("🟢 Socket connected");

  socket.on("device:update", ({ type, state }) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, [type]: state };
    });
  });

  socket.on("threshold:update", (payload) => {
    console.log("📡 Threshold realtime update:", payload);

    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...payload,
      };
    });
  });

  return () => {
    socket.off("device:update");
    socket.off("threshold:update");
    socket.disconnect();
  };
}, []);


  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    var data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    localStorage.setItem("token", data.data.token);
    setUser(data.data.user);

    return data;
  };

  const register = async (username, email, password) => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

  const data = await response.json();
      console.log(data)
  if (!data.success) {
    throw new Error(data.message || "Register failed");
  }

  return data;
};


  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateThreshold = async ({ tempThresholdHighC, tempThresholdLowC, soilThresholdLowPercent, soilThresholdHighPercent, humidThresholdLowPercent, humidThresholdHighPercent }) => {
    try {
      console.log({ tempThresholdHighC, tempThresholdLowC, soilThresholdLowPercent, soilThresholdHighPercent, humidThresholdLowPercent, humidThresholdHighPercent });
      const res = await updateThresholdApi({
        tempHigh: tempThresholdHighC
        , tempLow: tempThresholdLowC
        , soilLow: soilThresholdLowPercent,
        soilHigh: soilThresholdHighPercent,
        humidLow: humidThresholdLowPercent, humidHigh: humidThresholdHighPercent
      });
      const response = await getMeApi();
      setUser(response.user);
      return res.data;
    }
    catch (err) {
      console.error(err);
    }
  }

  const controlDevice = async ({ type, state }) => {
    try {
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [type]: state,
        };
      });

      await controlerDeviceApi({ type, state });
    } catch (err) {
      console.error("Control device error:", err);
    }
  };


  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateThreshold,
    controlDevice,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

