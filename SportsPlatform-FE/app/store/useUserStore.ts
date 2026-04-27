import { create } from 'zustand';

interface UserState {
  nickname: string | null;
  email: string | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  setUser: (nickname: string, email: string, accessToken: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  nickname: null,
  email: null,
  accessToken: null,
  isLoggedIn: false,

  setUser: (nickname, email, accessToken) => set({
    nickname,
    email,
    accessToken,
    isLoggedIn: true,
  }),

  clearUser: () => set({
    nickname: null,
    email: null,
    accessToken: null,
    isLoggedIn: false,
  }),
}));