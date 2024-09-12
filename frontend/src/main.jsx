import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Web3Provider } from './contexts/Web3Context';
import { SnackbarProvider } from 'notistack'; // Import SnackbarProvider
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3}> {/* Bọc ứng dụng với SnackbarProvider */}
      <ErrorBoundary>
        <Web3Provider>
          <App />
          {/* Không cần ToastContainer nữa */}
        </Web3Provider>
      </ErrorBoundary>
    </SnackbarProvider>
  </React.StrictMode>
);
