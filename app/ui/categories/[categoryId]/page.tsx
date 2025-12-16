'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import '@/app/globals.css';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (params.categoryId) {
      fetchCategory(params.categoryId as string);
    }
  }, [params.categoryId]);

  const fetchCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`);
      const data = await res.json();
      if (data.success) {
        setCategory(data.data);
        setFormData({
          name: data.data.name,
          description: data.data.description || '',
        });
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
      const res = await fetch(`/api/categories/${params.categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setCategory(data.data);
        setEditing(false);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!category) return <div className="error">Category not found</div>;

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
        <h1>Category Details</h1>
        {error && <div className="error">{error}</div>}
        {!editing ? (
          <div className="card">
            <h2>{category.name}</h2>
            {category.description && <p>{category.description}</p>}
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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

