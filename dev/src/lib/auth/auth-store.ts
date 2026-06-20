import { create } from "zustand";
import { clearAccessTokenCookie, getAccessTokenCookie } from "./cookies";

type AuthState = {
  isAuthenticated: boolean;
  hydrate: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hydrate: () => set({ isAuthenticated: Boolean(getAccessTokenCookie()) }),
  logout: () => {
    clearAccessTokenCookie();
    set({ isAuthenticated: false });
  },
}));
