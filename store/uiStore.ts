import { create } from "zustand";

type TemplateFilter = "all" | "clean" | "modern" | "creative";

interface UIStore {
  currentStep: number;
  activeFilter: TemplateFilter;
  isLoading: boolean;

  setStep: (step: number) => void;
  setFilter: (filter: TemplateFilter) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentStep: 1,
  activeFilter: "all",
  isLoading: false,

  setStep: (step) => set({ currentStep: step }),
  setFilter: (filter) => set({ activeFilter: filter }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
