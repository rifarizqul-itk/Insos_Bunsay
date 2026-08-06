import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminAppRoutes from './App';
import '@bunsay/shared-ui/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
