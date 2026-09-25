import { QueryClientProvider } from '@tanstack/react-query';
// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import './index.css';
import App from './App';
import { queryClient } from '@lib/query-client';
import { setupAxiosInterceptors } from '@lib/axios';
import { TooltipProvider } from '@/components/ui/tooltip';

setupAxiosInterceptors();

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>,
  // </StrictMode>,
);
