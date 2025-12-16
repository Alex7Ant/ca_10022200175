'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context';
import { useToast } from '@/lib/toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

interface Order {
  _id: string;
  user: any;
  items: any[];
  total: number;
  status: string;
  shippingAddress: any;
  createdAt: string;
  payment?: any;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user && user.role !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      router.push('/');
      return;
    }
    
    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchOrders(),
        fetchUsers(),
        fetchProducts(),
      ]);
    } catch (err: any) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
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
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order status updated!', 'success');
        fetchOrders();
        setSelectedOrder(null);
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to update order', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order deleted successfully', 'success');
        fetchOrders();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to delete order', 'error');
    }
  };

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return (
      <div>
        <Header />
        <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div className="card" style={{ padding: '4rem 2rem' }}>
            <h2>Access Denied</h2>
            <p style={{ color: 'var(--gray-600)', marginTop: '1rem' }}>
              This page is only accessible to administrators.
            </p>
            <Link href="/">
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Go Home
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Header />
      
      <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
          Admin Dashboard
        </h1>
        
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {orders.length}
            </div>
            <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Total Orders</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
              {users.length}
            </div>
            <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Total Users</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>
              {products.length}
            </div>
            <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Total Products</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>
              ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
            </div>
            <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Total Revenue</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--gray-300)' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'orders' ? 'white' : 'var(--text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : 'none',
            }}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'users' ? 'white' : 'var(--text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : 'none',
            }}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'products' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'products' ? 'white' : 'var(--text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: activeTab === 'products' ? '3px solid var(--primary)' : 'none',
            }}
          >
            Products
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>All Orders</h2>
            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
                No orders yet
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gray-300)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Order ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <td style={{ padding: '1rem' }}>
                          <code style={{ fontSize: '0.85rem' }}>
                            {order._id.substring(0, 8)}...
                          </code>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {typeof order.user === 'object' ? order.user.name : 'N/A'}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                          ${order.total.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background:
                                order.status === 'delivered'
                                  ? 'var(--success-light)'
                                  : order.status === 'cancelled'
                                  ? 'var(--danger-light)'
                                  : 'var(--warning-light)',
                              color:
                                order.status === 'delivered'
                                  ? 'var(--success)'
                                  : order.status === 'cancelled'
                                  ? 'var(--danger)'
                                  : 'var(--warning)',
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditingStatus(order.status);
                            }}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', marginRight: '0.5rem' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteOrder(order._id)}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>All Users</h2>
            {users.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
                No users yet
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gray-300)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Role</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <td style={{ padding: '1rem' }}>{u.name}</td>
                        <td style={{ padding: '1rem' }}>{u.email}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: u.role === 'admin' ? 'var(--danger-light)' : u.role === 'seller' ? 'var(--primary-light)' : 'var(--gray-200)',
                              color: u.role === 'admin' ? 'var(--danger)' : u.role === 'seller' ? 'var(--primary)' : 'var(--gray-700)',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>All Products</h2>
              <Link href="/ui/products">
                <button className="btn btn-primary">Manage Products</button>
              </Link>
            </div>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
                No products yet
              </p>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">${product.price.toFixed(2)}</div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                        Stock: {product.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Order</h2>
            
            <div className="form-group">
              <label>Order ID</label>
              <input type="text" value={selectedOrder._id} disabled />
            </div>
            
            <div className="form-group">
              <label>Customer</label>
              <input
                type="text"
                value={typeof selectedOrder.user === 'object' ? selectedOrder.user.name : 'N/A'}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label>Total</label>
              <input type="text" value={`$${selectedOrder.total.toFixed(2)}`} disabled />
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleUpdateOrderStatus(selectedOrder._id, editingStatus)}
                style={{ flex: 1 }}
              >
                Update Status
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedOrder(null)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

