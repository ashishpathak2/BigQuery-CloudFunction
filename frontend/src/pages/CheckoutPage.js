import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'New York', 'London', 'Tokyo', 'Singapore'];

export default function CheckoutPage({ cart, clearCart }) {
  const navigate = useNavigate();
  const [city, setCity]       = useState('Mumbai');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState('');

  const total = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="page-title">Checkout</h1>
        <div className="empty-state">
          <p>Your cart is empty. Add products before checking out.</p>
          <br />
          <Link to="/" className="btn btn-primary">Shop Products</Link>
        </div>
      </div>
    );
  }

  const placeOrder = async () => {
    setLoading(true);
    try {
      // Place one order per cart item (each triggers its own analytics event)
      for (const item of cart) {
        for (let q = 0; q < item.qty; q++) {
          await API.post('/api/orders', {
            productId: item.id,
            price: parseFloat(item.price),
            userId: Math.floor(Math.random() * 3) + 1,  // demo user 1-3
            city,
          });
        }
      }

      clearCart();
      setToast('🎉 Order placed! Analytics event sent to Pub/Sub → BigQuery');
      setTimeout(() => {
        setToast('');
        navigate('/dashboard');
      }, 2500);
    } catch (err) {
      console.error('Order error:', err);
      setToast('❌ Failed to place order. Is the backend running?');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Checkout</h1>
      {toast && <div className="toast">{toast}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: 900 }}>
        {/* Order Summary */}
        <div className="checkout-card">
          <h2 className="section-title">Order Summary</h2>
          <div className="order-summary">
            {cart.map(item => (
              <div key={item.id} className="order-summary-item">
                <span>{item.name} × {item.qty}</span>
                <span>${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="order-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="checkout-card">
          <h2 className="section-title">Shipping Details</h2>
          <div className="form-group">
            <label>City (used for analytics)</label>
            <select value={city} onChange={e => setCity(e.target.value)}>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ background: '#eff6ff', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '.85rem', color: '#1d4ed8' }}>
            <strong>📊 Analytics Pipeline:</strong><br />
            This purchase will emit a Pub/Sub event → Cloud Function → BigQuery → Dashboard
          </div>

          <button
            className="btn btn-success"
            style={{ width: '100%' }}
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? '⏳ Processing…' : `✅ Place Order — $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
