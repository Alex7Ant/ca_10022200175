'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  averageRating?: number;
  reviewCount?: number;
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = [
    'Experience Quality Products',
    'Shop with Confidence',
    'Fast & Secure Delivery',
  ];

  useEffect(() => {
    fetchCategories();
    fetchPopularProducts();
    fetchNewArrivals();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      const res = await fetch('/api/products?sortBy=averageRating&sortOrder=desc');
      const data = await res.json();
      if (data.success) {
        setPopularProducts(data.data.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const res = await fetch('/api/products?sortBy=createdAt&sortOrder=desc');
      const data = await res.json();
      if (data.success) {
        setNewArrivals(data.data.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const categoryIcons: { [key: string]: string } = {
    'Accessories': '👓',
    'Fashion': '👗',
    'Home Decor': '🏠',
    'Food & Spices': '🌶️',
    'Arts & Crafts': '🎨',
    'Beauty & Care': '💄',
    'Electronics': '📱',
    'Books': '📚',
  };

  return (
    <div>
      <Header />
      
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <button
            className="carousel-arrow left"
            onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          >
            ‹
          </button>
          <h1 className="hero-title">{heroSlides[heroIndex]}</h1>
          <button
            className="carousel-arrow right"
            onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
          >
            ›
          </button>
        </div>

        {/* Shop by Category */}
        {categories.length > 0 && (
          <div className="categories-section">
            <h2 className="section-title">Shop by Category</h2>
            <div className="categories-grid">
              {categories.map((category) => (
                <Link key={category._id} href={`/shop?category=${category._id}`}>
                  <div className="category-card">
                    <div className="category-icon">
                      {categoryIcons[category.name] || '📦'}
                    </div>
                    <div className="category-name">{category.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Products */}
        {popularProducts.length > 0 && (
          <div className="products-section">
            <h2 className="section-title">Popular Products</h2>
            <div className="products-grid">
              {popularProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <div className="products-section">
            <h2 className="section-title">New Arrivals</h2>
            <div className="products-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* View All Products */}
        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/shop">
              <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                View All Products
              </button>
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link href="/ui/products">
                  <button className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem', color: 'white', borderColor: 'white' }}>
                    Manage Products
                  </button>
                </Link>
                <Link href="/ui/categories">
                  <button className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem', color: 'white', borderColor: 'white' }}>
                    Manage Categories
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { isAuthenticated, token } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: product._id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Product added to cart!');
      }
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to add to wishlist');
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: product._id }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Added to wishlist!');
      }
    } catch (err) {
      alert('Failed to add to wishlist');
    }
  };

  return (
    <Link href={`/ui/products/${product._id}`}>
      <div className="product-card">
        <div className="product-image">
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>📦</span>
          )}
        </div>
        <div className="product-actions">
          <button className="product-action-btn" onClick={handleWishlist} title="Add to Wishlist">
            ❤️
          </button>
          <button className="product-action-btn" onClick={handleAddToCart} title="Add to Cart">
            🛒
          </button>
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-price">${product.price.toFixed(2)}</div>
          {product.averageRating && (
            <div className="product-rating">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.averageRating!) ? 'star' : 'star-empty'}>
                  ★
                </span>
              ))}
              <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
