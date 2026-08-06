import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import TenantAppRoutes from './App';
import '@bunsay/shared-ui/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TenantAppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
