import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { GeoProvider } from '@/context/GeoContext';
import { UIProvider } from '@/context/UIContext';
import App from './App.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <UIProvider>
          <AuthProvider>
            <GeoProvider>
              <CartProvider>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'var(--color-neutral-900)',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '14px',
                      padding: '12px 16px',
                    },
                    success: {
                      iconTheme: { primary: '#10B981', secondary: '#fff' },
                    },
                    error: {
                      iconTheme: { primary: '#EF4444', secondary: '#fff' },
                    },
                  }}
                />
              </CartProvider>
            </GeoProvider>
          </AuthProvider>
        </UIProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
