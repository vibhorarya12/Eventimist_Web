import axios from "axios";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";

const eventimistClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENTIMIST_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor — attach token on every call ─────────────────────────
eventimistClient.interceptors.request.use(
  (config) => {
    const token = useOrganizerAuth.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — handle 401 globally ───────────────────────────────
eventimistClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useOrganizerAuth.getState().clearAuth();
      window.location.href = "/organizer/auth";
    }
    return Promise.reject(error);
  }
);

export default eventimistClient;