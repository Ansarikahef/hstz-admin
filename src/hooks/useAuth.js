import apiService from "@/Utils/ApiService";
import Helper from "@/Utils/Helper";
import { useEffect, useState, useCallback } from "react";

const AUTH_KEY = "hz_auth";

const ADMIN_USER = {
  id: "adm_root",
  name: "Hari Zaveri",
  email: "admin@hztravelzone.com",
  role: "Super Admin",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=srgb&fm=jpg&w=400&q=85",
};

export function useAuth() {
  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isMobile = (value) => /^[0-9]{10}$/.test(value);
  const encodePassword = (password) => btoa(password);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const getDeviceInfo = () => ({
    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "web",
    deviceName: navigator.userAgent,
    deviceId: navigator.platform,
  });
  const getIP = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  };
  useEffect(() => {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_KEY);
  }, [user]);

  const login = useCallback(async ({ email, password }) => {
    // await new Promise((r) => setTimeout(r, 600));
    // if (email.trim().toLowerCase() === ADMIN_USER.email && password === "admin123") {
    //   setUser(ADMIN_USER);
    //   return { ok: true };
    // }
    // return { ok: false, error: "Invalid email or password. Use admin@hztravelzone.com / admin123" };

    try{
      const loginValue = email.trim();
      let loginType = "";
      let mobileNumber = "";
      let emailAddress = "";
      if (isEmail(loginValue)) {
        loginType = "email";
        emailAddress = loginValue;
      } else if (isMobile(loginValue)) {
        loginType = "mobile";
        mobileNumber = loginValue;
      }
      const device = getDeviceInfo();
      const ipAddress = await getIP();

      const payload = {
        mobileNumber,
        emailAddress,
        passwordHash: encodePassword(password),
        loginType,
        deviceType: device.deviceType,
        deviceName: device.deviceName,
        deviceId: device.deviceId,
        ipAddress,
      };
      const {status ,message,token,responseValue} = await apiService.post("admin/AdminLogin", payload);
      if(status === 1){
        localStorage.setItem("hstzAuthToken", token);
        Helper.saveLoginDetails(responseValue);
        return {status: 1,token, message: message || "Login successful. Welcome back!"};
      }
      else{
        return {status: 0,token:null, message: message || "Login failed. Please check your credentials and try again."};
      }      
    }
    catch(e){
      return {status: 0,token:null, message: "Network error. Please try again."};
    }

  }, []);

  const logout = useCallback(() => setUser(null), []);

  return { user, login, logout, isAuthed: Helper.isUserAuthenticated() };
}

export const DEMO_CREDENTIALS = { email: "admin@hztravelzone.com", password: "admin123" };
