import { create } from "zustand";

type AppState = {
  selectedTags: string[];
  selectedMapStop: number;
  toggleTag: (tag: string) => void;
  setSelectedMapStop: (stop: number) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedTags: ["굿즈", "사진"],
  selectedMapStop: 2,
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((item) => item !== tag)
        : [...state.selectedTags, tag]
    })),
  setSelectedMapStop: (stop) => set({ selectedMapStop: stop })
}));
