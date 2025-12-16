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
  description?: string;
}

export default function CategoriesPage() {
  const { isAuthenticated, user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.error);
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      setError(err.message);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category added successfully!', 'success');
        setShowForm(false);
        setFormData({ name: '', description: '' });
        fetchCategories(); // Refresh the list
      } else {
        setError(data.error);
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      setError(err.message);
      showToast('Failed to add category', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Category deleted successfully', 'success');
        fetchCategories();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to delete category', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading categories...</p>
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
            {isAuthenticated && user?.role === 'admin' ? 'Categories Management' : 'Browse Categories'}
          </h1>
          {(isAuthenticated && user?.role === 'admin') && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add New Category'}
            </button>
          )}
        </div>
        
        {error && <div className="error">{error}</div>}
        
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Category</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electronics, Fashion, Food"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">Create Category</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
            <h2>No categories yet</h2>
            <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem', marginBottom: '2rem' }}>
              {isAuthenticated && user?.role === 'admin' 
                ? 'Start by creating your first category to organize your products!'
                : 'No categories available at the moment. Please check back later.'
              }
            </p>
            {!showForm && isAuthenticated && user?.role === 'admin' && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Create Your First Category
              </button>
            )}
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <Link key={category._id} href={`/shop?category=${category._id}`}>
                <div className="category-card">
                  <div className="category-icon">📦</div>
                  <div className="category-name">{category.name}</div>
                  {category.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                      {category.description}
                    </p>
                  )}
                  {(isAuthenticated && user?.role === 'admin') && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/ui/categories/${category._id}`} onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                          Edit
                        </button>
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(category._id);
                        }}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
