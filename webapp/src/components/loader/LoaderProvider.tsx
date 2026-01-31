import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { LoaderContextState } from './types';
import { LoaderContext } from './LoaderContext';
import GlobalLoader from './GlobalLoader';

export const LoaderProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [state, setState] = useState<LoaderContextState>({
    count: 0,
  });

  const show = useCallback((message?: string) => {
    setState((s) => ({
      count: s.count + 1,
      message: message ?? s.message,
    }));
  }, []);

  const hide = useCallback(() => {
    setState((s) => ({
      count: Math.max(0, s.count - 1),
      message: s.count <= 1 ? undefined : s.message,
    }));
  }, []);

  const contextVallue = useMemo(() => ({ showLoading: show, hideLoading: hide }), [show, hide]);

  return (
    <LoaderContext.Provider value={contextVallue}>
      {children}
      {state.count > 0 && <GlobalLoader message={state.message} />}
    </LoaderContext.Provider>
  );
};
