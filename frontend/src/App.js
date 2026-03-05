import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';

function Navbar({ cartCount }) {
  const location = useLocation();
  const links = [
    { to: '/',          label: 'Products' },
    { to: '/cart',      label: `Cart ${cartCount > 0 ? `(${cartCount})` : ''}` },
    { to: '/dashboard', label: '📊 Dashboard' },
  ];
  return (
    <nav className="navbar">
      <div className="navbar-brand">🛍️ ShopCloud</div>
      <div className="navbar-links">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <BrowserRouter>
      <Navbar cartCount={cartCount} />
      <main className="main-content">
        <Routes>
          <Route path="/"          element={<ProductsPage addToCart={addToCart} />} />
          <Route path="/cart"      element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
          <Route path="/checkout"  element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
