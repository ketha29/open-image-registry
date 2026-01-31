import { useContext } from 'react';
import { LoaderContext } from './LoaderContext';
import { LoaderProvider } from './LoaderProvider';

const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) {
    throw new Error('useLoader must be used within LoaderProvider');
  }
  return ctx;
};

export { useLoader, LoaderProvider };
