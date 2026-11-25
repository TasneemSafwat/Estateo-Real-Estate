import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/i18n';
import '@/styles/index.css';
import { App } from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Estateo could not find the #root mount point.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
