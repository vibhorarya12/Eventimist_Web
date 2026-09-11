import axios from "axios";
import { useOrganizerAuth } from "@/store/eventimist/organizer/auth/AuthState";
import { useUserAuth } from "@/store/eventimist/user/auth/UserAuthState";
import { userRefreshToken } from "@/services/eventimist/user/auth/userRefreshToken.service";
import { organizerRefreshToken } from "@/services/eventimist/organizer/auth/organizerRefreshToken.service";

const eventimistClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENTIMIST_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor — attach token on every call ─────────────────────────
eventimistClient.interceptors.request.use(
  (config) => {
    // Skip auto-setting organizer token if Authorization header is already set
    // This allows user endpoints to pass their own user token
    if (!config.headers.Authorization) {
      const token = useOrganizerAuth.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // When the body is FormData, delete the global Content-Type so axios can
    // set "multipart/form-data; boundary=..." automatically.
    // Also raise timeout for file uploads — images can be slow on mobile.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      config.timeout = 30000;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
eventimistClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config    = error.config;
    const status    = error.response?.status;
    const errorCode = error.response?.data?.error;

    // ── User token refresh flow ──────────────────────────────────────────────
    // Only trigger when:
    // 1. Status is 401
    // 2. Error is ACCESS_TOKEN_EXPIRED
    // 3. Request had a Bearer token (authenticated endpoint)
    // 4. Not already retrying (prevents infinite loop)
    if (
      status === 401 &&
      errorCode === "ACCESS_TOKEN_EXPIRED" &&
      config.headers?.Authorization?.startsWith("Bearer ") &&
      !config._retry
    ) {
      config._retry = true;

      const { refreshToken, setAuth, clearAuth } = useUserAuth.getState();

      if (refreshToken) {
        try {
          const data = await userRefreshToken(refreshToken);

          // Persist new tokens
          setAuth({
            accessToken:  data.token,
            refreshToken: data.refreshToken,
            name:         data.name,
            email:        data.email,
            profilePic:   data.profilePic,
          });

          // Update cookie for middleware
          document.cookie = `user-token=${data.token}; path=/; SameSite=Strict`;

          // Patch Authorization header and retry original request
          config.headers.Authorization = `Bearer ${data.token}`;
          return eventimistClient(config);

        } catch {
          // Refresh failed — force logout
          clearAuth();
          document.cookie = "user-token=; path=/; max-age=0; SameSite=Strict";
          window.location.href = "/user";
          return Promise.reject(error);
        }
      }
    }

    // ── Organizer token refresh flow ─────────────────────────────────────────
    if (
      status === 401 &&
      errorCode === "ACCESS_TOKEN_EXPIRED" &&
      config.headers?.Authorization?.startsWith("Bearer ") &&
      !config._retry &&
      (config.url?.includes("/organizer/") || config.url?.includes("/auth/organizer"))
    ) {
      config._retry = true;

      const { refreshToken, setAuth, clearAuth } = useOrganizerAuth.getState();

      if (refreshToken) {
        try {
          const data = await organizerRefreshToken(refreshToken);

          setAuth({
            accessToken:  data.token,
            refreshToken: data.refreshToken,
            name:         data.name,
            email:        data.email,
            bio:          data.bio,
            profilePic:   data.profilePic,
            coverImage:   data.coverImage,
            location:     data.location,
          });

          document.cookie = `organizer-token=${data.token}; path=/; SameSite=Strict`;

          config.headers.Authorization = `Bearer ${data.token}`;
          return eventimistClient(config);

        } catch {
          clearAuth();
          document.cookie = "organizer-token=; path=/; max-age=0; SameSite=Strict";
          window.location.href = "/organizer/auth";
          return Promise.reject(error);
        }
      }
    }

    // ── Organizer 401 non-expired (wrong token, revoked etc.) ────────────────
    if (
      status === 401 &&
      errorCode !== "ACCESS_TOKEN_EXPIRED" &&
      (config?.url?.includes("/organizer/") || config?.url?.includes("/auth/organizer"))
    ) {
      useOrganizerAuth.getState().clearAuth();
      document.cookie = "organizer-token=; path=/; max-age=0; SameSite=Strict";
      window.location.href = "/organizer/auth";
    }

    return Promise.reject(error);
  }
);

// ─── Public client — no auth token, for public endpoints ─────────────────────
export const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENTIMIST_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default eventimistClient;