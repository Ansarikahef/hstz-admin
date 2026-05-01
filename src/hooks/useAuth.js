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
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_KEY);
  }, [user]);

  const login = useCallback(async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 600));
    if (email.trim().toLowerCase() === ADMIN_USER.email && password === "admin123") {
      setUser(ADMIN_USER);
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password. Use admin@hztravelzone.com / admin123" };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return { user, login, logout, isAuthed: !!user };
}

export const DEMO_CREDENTIALS = { email: "admin@hztravelzone.com", password: "admin123" };
