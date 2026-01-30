export type LoaderContextType = {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
};

export type LoaderContextState = {
  message?: string;
  count: number;
};
