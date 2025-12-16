'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../app/globals.css';

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
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user: '',
    items: [{ product: '', quantity: '1' }],
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: formData.user,
          items: formData.items.map((item) => ({
            product: item.product,
            quantity: parseInt(item.quantity),
          })),
          shippingAddress: formData.shippingAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({
          user: '',
          items: [{ product: '', quantity: '1' }],
          shippingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
        });
        fetchOrders();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: '1' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

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
        <h1>Orders Management</h1>
        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create New Order'}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>User</label>
              <select
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Items</label>
              {formData.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select
                    value={item.product}
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                    required
                    style={{ flex: 2 }}
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addItem}>
                Add Item
              </button>
            </div>
            <div className="form-group">
              <label>Shipping Address</label>
              <input
                type="text"
                placeholder="Street"
                value={formData.shippingAddress.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, street: e.target.value },
                  })
                }
                required
              />
              <input
                type="text"
                placeholder="City"
                value={formData.shippingAddress.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, city: e.target.value },
                  })
                }
                required
                style={{ marginTop: '0.5rem' }}
              />
              <input
                type="text"
                placeholder="State"
                value={formData.shippingAddress.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, state: e.target.value },
                  })
                }
                required
                style={{ marginTop: '0.5rem' }}
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={formData.shippingAddress.zipCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, zipCode: e.target.value },
                  })
                }
                required
                style={{ marginTop: '0.5rem' }}
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.shippingAddress.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, country: e.target.value },
                  })
                }
                required
                style={{ marginTop: '0.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Order</button>
          </form>
        )}
        <div style={{ marginTop: '2rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="card">
              <h3>Order #{order._id.slice(-6)}</h3>
              <p><strong>User:</strong> {typeof order.user === 'object' ? `${order.user.name} (${order.user.email})` : 'N/A'}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              <p><strong>Items:</strong></p>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {typeof item.product === 'object' ? item.product.name : 'N/A'} - Qty: {item.quantity} - ${item.price.toFixed(2)} each
                  </li>
                ))}
              </ul>
              <p><strong>Shipping Address:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
              <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link href={`/ui/orders/${order._id}`}>
                  <button className="btn btn-secondary">View</button>
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(order._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

