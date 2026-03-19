import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AuthProvider from './contexts/AuthContext';
import RepoProvider from './contexts/RepoContext';
import './styles/global.css';

/**
 * Main entry point — renders React app with global providers
 * Provider nesting order: BrowserRouter (routing) wraps App
 * AuthProvider wraps the entire app to supply auth state
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RepoProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </RepoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
