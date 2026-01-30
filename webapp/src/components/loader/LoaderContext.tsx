import { createContext } from 'react';
import { LoaderContextType } from './types';

export const LoaderContext = createContext<LoaderContextType | undefined>(undefined);
