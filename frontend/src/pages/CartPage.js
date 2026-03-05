import React from 'react';
import { Link } from 'react-router-dom';

export default function CartPage({ cart, removeFromCart }) {
  const total = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="page-title">Your Cart</h1>
        <div className="empty-state">
          <p>🛒 Your cart is empty.</p>
          <br />
          <Link to="/" className="btn btn-primary">Shop Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Your Cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id}>
              <td style={{ fontWeight: 500 }}>{item.name}</td>
              <td>${parseFloat(item.price).toFixed(2)}</td>
              <td>{item.qty}</td>
              <td>${(parseFloat(item.price) * item.qty).toFixed(2)}</td>
              <td>
                <button className="btn btn-danger" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-total-row">
        <div>
          <div className="cart-total-label">Order Total</div>
          <div style={{ fontSize: '.85rem', color: 'var(--gray-400)' }}>{cart.reduce((s,i) => s+i.qty,0)} item(s)</div>
        </div>
        <div className="cart-total-value">${total.toFixed(2)}</div>
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem' }}>
        <Link to="/" className="btn btn-outline">← Continue Shopping</Link>
        <Link to="/checkout" className="btn btn-success">Proceed to Checkout →</Link>
      </div>
    </div>
  );
}
