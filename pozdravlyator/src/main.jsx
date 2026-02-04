import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './store/ThemeContext';
import { PaletteProvider } from './store/PaletteContext';
import { SettingsProvider } from './store/SettingsContext';
import { AuthProvider } from './store/AuthContext';
import { AppProvider } from './store/AppContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PaletteProvider>
          <SettingsProvider>
            <AuthProvider>
              <AppProvider>
                <App />
              </AppProvider>
            </AuthProvider>
          </SettingsProvider>
        </PaletteProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
