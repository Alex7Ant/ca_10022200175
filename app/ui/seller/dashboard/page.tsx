'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context';
import { useToast } from '@/lib/toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

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
  category: any;
  image?: string;
  seller?: string;
}

export default function SellerDashboard() {
  const { isAuthenticated, user, token } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyProducts();
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchMyProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        // Filter to show only seller's products if they have seller ID
        const filtered = data.data.filter((p: Product) => 
          p.seller && user && p.seller === user._id
        );
        setMyProducts(filtered);
      }
    } catch (err: any) {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        showToast('Image uploaded successfully!', 'success');
        setUploading(false);
      };
      reader.onerror = () => {
        showToast('Failed to upload image', 'error');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast('Failed to upload image', 'error');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        showToast('Product listed successfully!', 'success');
        setShowForm(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          image: '',
        });
        fetchMyProducts();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to list product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product deleted successfully', 'success');
        fetchMyProducts();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to delete product', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <Header />
        <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div className="card" style={{ padding: '4rem 2rem' }}>
            <h2>Please login to access the seller dashboard</h2>
            <Link href="/auth/login">
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Login
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
          <p>Loading dashboard...</p>
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
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Seller Dashboard</h1>
            <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
              Manage your product listings
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ List New Product'}
          </button>
        </div>
        
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {myProducts.length}
            </div>
            <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Total Products</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
              {myProducts.filter(p => p.stock > 0).length}
            </div>
            <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>In Stock</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>
              {myProducts.filter(p => p.stock === 0).length}
            </div>
            <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Out of Stock</div>
          </div>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>List New Product</h2>
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
                  placeholder="Describe your product"
                  rows={4}
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
              </div>
              
              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                  Max file size: 2MB. Supported formats: JPG, PNG, GIF, WebP
                </p>
                {uploading && <p style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>Uploading...</p>}
                {formData.image && (
                  <div style={{ marginTop: '1rem' }}>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'List Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Products */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>My Products</h2>
          
          {myProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3>No products listed yet</h3>
              <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem', marginBottom: '2rem' }}>
                Start selling by listing your first product!
              </p>
              {!showForm && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  List Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {myProducts.map((product) => (
                <div key={product._id} className="product-card">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-image" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
                  ) : (
                    <div className="product-image" style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-200)', borderRadius: '8px 8px 0 0' }}>
                      <span style={{ fontSize: '3rem' }}>📦</span>
                    </div>
                  )}
                  <div className="product-info" style={{ padding: '1rem' }}>
                    <h3 className="product-name">{product.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '0.5rem', minHeight: '40px' }}>
                      {product.description.substring(0, 80)}...
                    </p>
                    <div className="product-price">${product.price.toFixed(2)}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      Stock: <strong>{product.stock}</strong> | Category: <strong>{typeof product.category === 'object' ? product.category.name : 'N/A'}</strong>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/ui/products/${product._id}`} style={{ flex: 1 }}>
                        <button className="btn btn-secondary" style={{ width: '100%' }}>View</button>
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

