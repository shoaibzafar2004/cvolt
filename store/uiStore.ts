import { create } from "zustand";

type TemplateFilter = "all" | "clean" | "modern" | "creative";

interface UIStore {
  currentStep: number;
  activeFilter: TemplateFilter;
  isLoading: boolean;
  /** Resume draft is ready: read from localStorage, or loaded from the DB when that was empty */
  draftReady: boolean;

  setStep: (step: number) => void;
  setFilter: (filter: TemplateFilter) => void;
  setLoading: (loading: boolean) => void;
  setDraftReady: (ready: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentStep: 1,
  activeFilter: "all",
  isLoading: false,
  draftReady: false,

  setStep: (step) => set({ currentStep: step }),
  setFilter: (filter) => set({ activeFilter: filter }),
  setLoading: (loading) => set({ isLoading: loading }),
  setDraftReady: (ready) => set({ draftReady: ready }),
}));
