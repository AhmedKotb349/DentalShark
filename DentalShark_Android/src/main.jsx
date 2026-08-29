import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import './index.css';

import { ThemeProvider }    from './context/ThemeContext';
import { AuthProvider }     from './context/AuthContext';
import { ToastProvider }    from './context/ToastContext';
import { ProductsProvider } from './context/ProductsContext';
import { CartProvider }     from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Layout               from './components/layout/Layout';
import RequireAuth          from './components/ui/RequireAuth';

import HomePage             from './pages/HomePage';
import ShopPage             from './pages/ShopPage';
import ProductPage          from './pages/ProductPage';
import AuthPage             from './pages/AuthPage';
import OrderConfirmedPage   from './pages/OrderConfirmedPage';
import AIScannerPage        from './pages/AIScannerPage';
import EngineersPage        from './pages/EngineersPage';
import AboutPage            from './pages/AboutPage';
import ContactPage          from './pages/ContactPage';
import SharkPointsPage      from './pages/SharkPointsPage';
import DashboardPage        from './pages/DashboardPage';
import WishlistPage         from './pages/WishlistPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ProductsProvider>
              <CartProvider>
                <WishlistProvider>
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/"                element={<HomePage />} />
                      <Route path="/shop"            element={<ShopPage />} />
                      <Route path="/product/:id"     element={<ProductPage />} />
                      <Route path="/ai-scanner"      element={<AIScannerPage />} />
                      <Route path="/ai"              element={<Navigate to="/ai-scanner" replace />} />
                      <Route path="/engineers"       element={<EngineersPage />} />
                      <Route path="/about"           element={<AboutPage />} />
                      <Route path="/contact"         element={<ContactPage />} />
                      <Route path="/shark-points"    element={<SharkPointsPage />} />
                      <Route path="/sharkpoints"     element={<Navigate to="/shark-points" replace />} />
                      <Route path="/wishlist"        element={<WishlistPage />} />
                      <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
                      <Route path="/dashboard"       element={<DashboardPage />} />
                    </Route>
                    <Route path="/login"  element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="*"       element={<Navigate to="/" replace />} />
                  </Routes>
                </WishlistProvider>
              </CartProvider>
            </ProductsProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
