import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'virtual:svg-icons-register';
import App from './App.tsx';
import './index.css';

//@ts-expect-error window
window.__build_version = __buildVersion;

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY,
  environment: import.meta.env.MODE,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
