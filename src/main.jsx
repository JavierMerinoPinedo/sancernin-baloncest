import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './ThemeContext.jsx';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
