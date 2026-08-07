"use client";

import { AppContextType, Application, AppProviderProps, User } from "@/type";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

// All five services default to the API gateway (single origin, port 8080).
// Set an individual NEXT_PUBLIC_*_SERVICE_URL to bypass the gateway and talk
// to that service directly (e.g. for debugging one service in isolation).
const GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8080";

export const utils_service =
  process.env.NEXT_PUBLIC_UTILS_SERVICE_URL || GATEWAY_URL;
export const auth_service =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || GATEWAY_URL;
export const user_service =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL || GATEWAY_URL;
export const job_service =
  process.env.NEXT_PUBLIC_JOB_SERVICE_URL || GATEWAY_URL;
export const payment_service =
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || GATEWAY_URL;

const ACCESS_TOKEN_COOKIE = "token";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const setAuthCookies = (accessToken: string, refreshToken: string) => {
  Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    expires: 1 / 96, // ~15 minutes, matches the access token's own lifetime
    secure: false,
    path: "/",
  });
  Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    expires: 7,
    secure: false,
    path: "/",
  });
};

const clearAuthCookies = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: "/" });
};

// Transparently refreshes an expired access token using the refresh token
// and retries the original request once. Registered globally so every
// axios call in the app (not just ones made through this context) benefits.
let refreshInFlight: Promise<string | null> | null = null;

const COLD_START_MAX_RETRIES = 2;
const COLD_START_RETRY_DELAY_MS = 5000;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Render's free tier spins services down after ~15 minutes idle; a
    // cold start can take 20-45s to boot, which the platform's own
    // request timeout doesn't always survive, surfacing as a 502/503
    // even though the service comes up fine moments later. Retry GET
    // requests (safe to repeat) a couple of times with a pause instead
    // of surfacing a hard error for what's really just "still waking up."
    if (
      (status === 502 || status === 503) &&
      originalRequest &&
      originalRequest.method?.toLowerCase() === "get" &&
      (originalRequest._coldStartRetries || 0) < COLD_START_MAX_RETRIES
    ) {
      originalRequest._coldStartRetries =
        (originalRequest._coldStartRetries || 0) + 1;
      await new Promise((resolve) =>
        setTimeout(resolve, COLD_START_RETRY_DELAY_MS)
      );
      return axios(originalRequest);
    }

    if (
      status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshInFlight) {
        refreshInFlight = axios
          .post(`${auth_service}/api/auth/refresh`, { refreshToken })
          .then(({ data }) => {
            setAuthCookies(data.accessToken, data.refreshToken);
            return data.accessToken as string;
          })
          .finally(() => {
            refreshInFlight = null;
          });
      }

      const newAccessToken = await refreshInFlight;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return axios(originalRequest);
    } catch (refreshError) {
      clearAuthCookies();
      return Promise.reject(refreshError);
    }
  }
);

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const token = Cookies.get("token");

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${user_service}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfilePic(fromData: any) {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${user_service}/api/user/update/pic`,
        fromData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateResume(fromData: any) {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${user_service}/api/user/update/resume`,
        fromData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(name: string, phoneNumber: string, bio: string) {
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `${user_service}/api/user/update/profile`,
        { name, phoneNumber, bio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function logoutUser() {
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

    try {
      await axios.post(
        `${auth_service}/api/auth/logout`,
        { refreshToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log(error);
    }

    clearAuthCookies();
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully");
  }

  async function addSkill(
    skill: string,
    setSkill: React.Dispatch<React.SetStateAction<string>>
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${user_service}/api/user/skill/add`,
        { skillName: skill },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      setSkill("");
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function removeSkill(skill: string) {
    try {
      const { data } = await axios.put(
        `${user_service}/api/user/skill/delete`,
        { skillName: skill },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  async function applyJob(job_id: number) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${user_service}/api/user/apply/job`,
        { job_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  const [applications, setApplications] = useState<Application[]>([]);

  async function fetchApplications() {
    try {
      const { data } = await axios.get(
        `${user_service}/api/user/application/all?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(data.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchApplications();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        btnLoading,
        setUser,
        isAuth,
        setIsAuth,
        setLoading,
        logoutUser,
        updateProfilePic,
        updateResume,
        updateUser,
        addSkill,
        removeSkill,
        applyJob,
        applications,
        fetchApplications,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
