import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* basename é necessário pq sua app roda em /projeto-pet-shop-frontend */}
    <BrowserRouter basename="/projeto-pet-shop-frontend">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
