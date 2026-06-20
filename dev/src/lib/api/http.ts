import axios from "axios";
import {
  clearAccessTokenCookie,
  getAccessTokenCookie,
} from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/auth/constants";

export const http = axios.create({
  baseURL: getApiBaseUrl(),
});

http.interceptors.request.use((config) => {
  const token = getAccessTokenCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.code;

    if (code === "AUTH_REQUIRED_PROFILE_INFO") {
      window.location.href = "/nickname";
    } else if (error.response?.status === 401) {
      clearAccessTokenCookie();
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);
