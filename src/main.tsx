import '@/utils/trusted-security-policies';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';
// https://legendapp.com/open-source/state/v3/usage/configuring/
enableReactTracking({
  warnMissingUse: true,
});

if (typeof window !== 'undefined')
  import('@/registerSW');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
