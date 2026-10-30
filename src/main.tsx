import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { PortfolioProvider } from './context/PortfolioContext';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </React.StrictMode>
);
