import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

export default function ProductsPage({ addToCart }) {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [added, setAdded]         = useState(null);

  useEffect(() => {
    API.get('/api/products')
      .then(r => setProducts(r.data))
      .catch(() => {
        // Fallback demo products when backend not running
        setProducts([
          { id: 1, name: 'Laptop Pro 15"',     description: 'High-performance laptop, 16GB RAM, 512GB SSD', price: 1299.99, image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
          { id: 2, name: 'Smartphone X12',      description: 'Latest flagship phone, 5G, OLED display',      price: 899.99,  image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
          { id: 3, name: 'Wireless Headphones', description: 'Noise-cancelling, 30h battery',                price: 299.99,  image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
          { id: 4, name: 'Mechanical Keyboard', description: 'RGB backlit, tactile switches, TKL layout',    price: 149.99,  image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
          { id: 5, name: '4K Monitor 27"',      description: 'IPS panel, 144Hz, USB-C hub',                  price: 549.99,  image_url: 'https://images.unsplash.com/photo-1527443224154-c4a573d5b5c1?w=400' },
          { id: 6, name: 'Wireless Mouse',      description: 'Ergonomic, 70h battery, silent clicks',        price: 59.99,   image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (product) => {
    addToCart(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  if (loading) return <div className="loading">Loading products…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Products</h1>
        <Link to="/cart" className="btn btn-outline">View Cart</Link>
      </div>

      <div className="products-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            <img src={p.image_url} alt={p.name} />
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-desc">{p.description}</div>
              <div className="product-price">${parseFloat(p.price).toFixed(2)}</div>
              <button
                className="btn btn-primary"
                onClick={() => handleAdd(p)}
              >
                {added === p.id ? '✓ Added!' : '🛒 Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
