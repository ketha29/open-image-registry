import React, { ReactNode, useState } from 'react';
import { LoaderContextState } from './types';
import { LoaderContext } from './LoaderContext';
import GlobalLoader from './GlobalLoader';

export const LoaderProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [state, setState] = useState<LoaderContextState>({
    count: 0,
  });

  const show = (message?: string) => {
    setState((s) => ({
      count: s.count + 1,
      message: message ?? s.message,
    }));
  };

  const hide = () => {
    setState((s) => ({
      count: Math.max(0, s.count - 1),
      message: s.count <= 1 ? undefined : s.message,
    }));
  };

  return (
    <LoaderContext.Provider value={{ showLoading: show, hideLoading: hide }}>
      {children}
      {state.count > 0 && <GlobalLoader message={state.message} />}
    </LoaderContext.Provider>
  );
};
