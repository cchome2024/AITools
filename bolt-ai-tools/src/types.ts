import { ReactNode } from 'react';

export interface Tool {
  id: string;
  icon: ReactNode;
  name: string;
  description: string;
  category: string;
  isNew?: boolean;
  features?: string[];
  useCases?: string[];
}