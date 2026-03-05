import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import API from '../utils/api';

const PRODUCT_NAMES = {
  1: 'Laptop',
  2: 'Smartphone',
  3: 'Headphones',
  4: 'Keyboard',
  5: 'Monitor',
  6: 'Mouse',
};

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#0891b2', '#db2777'];

const PIPELINE = [
  'React Frontend',
  '→',
  'Node.js API',
  '→',
  'PostgreSQL',
  '→',
  'Pub/Sub',
  '→',
  'Cloud Function',
  '→',
  'BigQuery',
  '→',
  'Dashboard',
];

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [revenue,     setRevenue]     = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [cityData,    setCityData]    = useState([]);
  const [salesTime,   setSalesTime]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2, r3, r4] = await Promise.allSettled([
        API.get('/api/analytics/revenue'),
        API.get('/api/analytics/top-products'),
        API.get('/api/analytics/revenue-by-city'),
        API.get('/api/analytics/sales-over-time'),
      ]);

      if (r1.status === 'fulfilled') setRevenue(r1.value.data);
      if (r2.status === 'fulfilled') setTopProducts(r2.value.data.map(d => ({
        ...d,
        name: PRODUCT_NAMES[d.product_id] || `Product ${d.product_id}`,
        sales: Number(d.sales),
        revenue: Number(d.revenue),
      })));
      if (r3.status === 'fulfilled') setCityData(r3.value.data.map(d => ({
        ...d,
        revenue: Number(d.revenue),
        orders: Number(d.orders),
      })));
      if (r4.status === 'fulfilled') setSalesTime(r4.value.data.map(d => ({
        ...d,
        revenue: Number(d.revenue),
        orders: Number(d.orders),
      })));

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchAll]);

  const fmt = (n) => n !== undefined && n !== null
    ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>📊 Analytics Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button className="btn btn-outline" onClick={fetchAll} disabled={loading}>
            {loading ? '⏳ Loading…' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="pipeline-card">
        <div className="chart-title">📡 Live Data Pipeline</div>
        <div className="pipeline-steps">
          {PIPELINE.map((step, i) =>
            step === '→'
              ? <span key={i} className="pipeline-arrow">→</span>
              : <span key={i} className="pipeline-step">{step}</span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Revenue"
          value={revenue ? fmt(revenue.total_revenue) : '—'}
          sub="All time from BigQuery"
          color="#2563eb"
        />
        <StatCard
          label="Total Orders"
          value={revenue ? Number(revenue.total_orders).toLocaleString() : '—'}
          sub="Processed through pipeline"
        />
        <StatCard
          label="Avg Order Value"
          value={revenue ? fmt(revenue.avg_order_value) : '—'}
          sub="Per purchase"
        />
        <StatCard
          label="Cities"
          value={cityData.length || '—'}
          sub="Active markets"
          color="#16a34a"
        />
      </div>

      {loading && topProducts.length === 0 && (
        <div className="loading">⏳ Querying BigQuery… (make sure backend is running)</div>
      )}

      {/* Charts row */}
      {topProducts.length > 0 && (
        <div className="chart-grid">
          {/* Bar chart — top products */}
          <div className="chart-card">
            <div className="chart-title">🏆 Sales by Product</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProducts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => n === 'revenue' ? fmt(v) : v} />
                <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart — revenue by city */}
          <div className="chart-card">
            <div className="chart-title">🌍 Revenue by City</div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={cityData}
                  dataKey="revenue"
                  nameKey="city"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ city, percent }) => `${city} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {cityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Line chart — sales over time */}
      {salesTime.length > 0 && (
        <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
          <div className="chart-title">📈 Revenue Over Time (Last 30 Days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => n === 'revenue' ? fmt(v) : v} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} name="Revenue ($)" />
              <Line type="monotone" dataKey="orders"  stroke="#16a34a" strokeWidth={2} dot={false} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* City table */}
      {cityData.length > 0 && (
        <div className="chart-card">
          <div className="chart-title">📋 Revenue by City — Detail</div>
          <table className="cart-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {cityData.map((row, i) => (
                <tr key={row.city}>
                  <td>
                    <span style={{ marginRight: '.5rem' }}>{['🥇','🥈','🥉'][i] || '  '}</span>
                    {row.city}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{fmt(row.revenue)}</td>
                  <td><span className="badge">{row.orders}</span></td>
                  <td>{fmt(row.revenue / row.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && topProducts.length === 0 && (
        <div className="empty-state">
          <p>📭 No analytics data yet.</p>
          <p style={{ marginTop: '.5rem' }}>Place an order to see the BigQuery pipeline in action!</p>
          <br />
          <a href="/" className="btn btn-primary">Go Shopping →</a>
        </div>
      )}
    </div>
  );
}
