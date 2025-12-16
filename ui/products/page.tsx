'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context';
import { useToast } from '@/lib/toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../../app/globals.css';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category | string;
  image?: string;
  averageRating?: number;
  reviewCount?: number;
}

export default function ProductsPage() {
  const { isAuthenticated, user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.error);
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      setError(err.message);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product added successfully!', 'success');
        setShowForm(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          image: '',
        });
        fetchProducts(); // Refresh the list
      } else {
        setError(data.error);
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      setError(err.message);
      showToast('Failed to add product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Product deleted successfully', 'success');
        fetchProducts();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to delete product', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>
            {isAuthenticated && user?.role === 'admin' ? 'Products Management' : 'All Products'}
          </h1>
          {(isAuthenticated && user?.role === 'admin') && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add New Product'}
            </button>
          )}
        </div>
        
        {error && <div className="error">{error}</div>}
        
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Product</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p style={{ marginTop: '0.5rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                    No categories available. <Link href="/ui/categories" style={{ color: 'var(--primary)' }}>Create one first</Link>
                  </p>
                )}
              </div>
              <div className="form-group">
                <label>Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">Create Product</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {products.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <h2>No products yet</h2>
            <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem', marginBottom: '2rem' }}>
              {isAuthenticated && user?.role === 'admin' 
                ? 'Start by adding your first product! Make sure you have at least one category created first.'
                : 'No products available at the moment. Please check back later.'
              }
            </p>
            {!showForm && isAuthenticated && user?.role === 'admin' && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-image">
                    <span>📦</span>
                  </div>
                )}
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '0.5rem', minHeight: '40px' }}>
                    {product.description.substring(0, 80)}...
                  </p>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                    Stock: {product.stock} | Category: {typeof product.category === 'object' ? product.category.name : 'N/A'}
                  </div>
                  {product.averageRating && (
                    <div className="product-rating" style={{ marginTop: '0.5rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.averageRating!) ? 'star' : 'star-empty'}>★</span>
                      ))}
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>({product.reviewCount || 0})</span>
                    </div>
                  )}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/ui/products/${product._id}`} style={{ flex: 1 }}>
                      <button className="btn btn-secondary" style={{ width: '100%' }}>View</button>
                    </Link>
                    {(isAuthenticated && user?.role === 'admin') && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
