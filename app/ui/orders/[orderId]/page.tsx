'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import '@/app/globals.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
}

interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  total: number;
  status: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
  });

  useEffect(() => {
    if (params.orderId) {
      fetchOrder(params.orderId as string);
    }
  }, [params.orderId]);

  const fetchOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setFormData({ status: data.data.status });
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/orders/${params.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: formData.status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setEditing(false);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div>
      <nav className="nav">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/ui/users">Users</Link></li>
          <li><Link href="/ui/products">Products</Link></li>
          <li><Link href="/ui/categories">Categories</Link></li>
          <li><Link href="/ui/orders">Orders</Link></li>
        </ul>
      </nav>
      <div className="container">
        <h1>Order Details</h1>
        {error && <div className="error">{error}</div>}
        {!editing ? (
          <div className="card">
            <h2>Order #{order._id.slice(-6)}</h2>
            <p><strong>User:</strong> {typeof order.user === 'object' ? `${order.user.name} (${order.user.email})` : 'N/A'}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            <div>
              <strong>Items:</strong>
              <ul style={{ marginTop: '0.5rem' }}>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {typeof item.product === 'object' ? item.product.name : 'N/A'} - Qty: {item.quantity} - ${item.price.toFixed(2)} each
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong>Shipping Address:</strong>
              <p>
                {order.shippingAddress.street},<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode},<br />
                {order.shippingAddress.country}
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Update Status
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

