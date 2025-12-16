'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context';
import { useState, useEffect } from 'react';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        return;
      }
      
      const res = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        setCartCount(0);
        return;
      }
      
      const data = await res.json();
      if (data.success && data.data.items) {
        setCartCount(data.data.items.length);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      setCartCount(0);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo">
          <span className="logo-icon">🛒</span>
          <span>CloudEcom</span>
        </Link>

        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/shop" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: '500' }}>
            Shop
          </Link>
          <Link href="/ui/categories" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: '500' }}>
            Categories
          </Link>
          {isAuthenticated && (user?.role === 'seller' || user?.role === 'admin') && (
            <Link href="/ui/seller/dashboard" style={{ color: 'var(--success)', textDecoration: 'none', fontWeight: '500' }}>
              Seller Dashboard
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link href="/ui/admin/dashboard" style={{ color: 'var(--danger)', textDecoration: 'none', fontWeight: '500' }}>
              Admin Dashboard
            </Link>
          )}
        </nav>

        <form className="search-bar" onSubmit={(e) => {
          e.preventDefault();
          const searchTerm = (e.currentTarget.querySelector('input') as HTMLInputElement)?.value;
          if (searchTerm) {
            window.location.href = `/shop?search=${encodeURIComponent(searchTerm)}`;
          }
        }}>
          <input
            type="text"
            placeholder="Search for products..."
          />
          <button type="submit">Search</button>
        </form>

        <div className="header-actions">
          <span className="header-icon" title="Notifications">
            🔔
            <span className="header-icon-badge">3</span>
          </span>
          
          {isAuthenticated && (
            <>
              <Link href="/ui/wishlist" className="header-icon" title="Wishlist">
                ❤️
              </Link>
              <Link href="/ui/profile" className="header-icon" title="Profile">
                👤
              </Link>
            </>
          )}
          
          <Link href="/ui/cart" className="header-icon" title="Cart">
            🛒
            {cartCount > 0 && (
              <span className="header-icon-badge">{cartCount}</span>
            )}
          </Link>

          {!isAuthenticated ? (
            <>
              <Link href="/auth/login">
                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Login
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

