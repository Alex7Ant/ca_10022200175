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
  image?: string;
  averageRating?: number;
  reviewCount?: number;
  category: Category | string;
}

export default function ShopPage() {
  const { isAuthenticated, token, user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [onSale, setOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const category = params.get('category');
    if (search) setSearchTerm(search);
    if (category) setSelectedCategory(category);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, minPrice, maxPrice, sortBy, sortOrder, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (searchTerm) params.append('search', searchTerm);
      if (minRating) params.append('minRating', minRating.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
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

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'info');
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product added to cart!', 'success');
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      showToast('Please login to add to wishlist', 'info');
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Added to wishlist!', 'success');
      }
    } catch (err: any) {
      showToast('Failed to add to wishlist', 'error');
    }
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColors([]);
    setSelectedSizes([]);
    setOnSale(false);
    setMinRating(0);
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const colors = ['#ef4444', '#3b82f6', '#000000', '#fbbf24', '#10b981', '#ffffff'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

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
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
          {/* Filter Sidebar */}
          <aside className="filter-sidebar">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Filters</h2>
            
            <div className="filter-section">
              <div className="filter-title">Category</div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid var(--gray-300)' }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <div className="filter-title">Color</div>
              <div className="color-swatches">
                {colors.map((color) => (
                  <div
                    key={color}
                    className="color-swatch"
                    style={{
                      background: color,
                      borderColor: selectedColors.includes(color) ? 'var(--primary)' : 'var(--gray-300)',
                      borderWidth: selectedColors.includes(color) ? '3px' : '2px',
                    }}
                    onClick={() => {
                      setSelectedColors((prev) =>
                        prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-title">Size</div>
              <div className="size-buttons">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSizes((prev) =>
                        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                      );
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-title">Price Range</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid var(--gray-300)' }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid var(--gray-300)' }}
                />
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-title">Ratings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === rating}
                      onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                    />
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < rating ? 'star' : 'star-empty'}>★</span>
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={onSale}
                  onChange={(e) => setOnSale(e.target.checked)}
                />
                <span>On Sale</span>
              </label>
            </div>

            <div className="filter-section">
              <div className="filter-title">Sort By</div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid var(--gray-300)' }}
              >
                <option value="createdAt-desc">Newest Arrivals</option>
                <option value="price-asc">Lowest Price</option>
                <option value="price-desc">Highest Price</option>
                <option value="averageRating-desc">Most Popular</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={resetFilters} style={{ flex: 1, padding: '0.75rem' }}>
                Reset
              </button>
              <button className="btn btn-primary" onClick={fetchProducts} style={{ flex: 1, padding: '0.75rem' }}>
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <main>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>
                {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
              </h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray-600)' }}>{products.length} products</span>
                {isAuthenticated && user?.role === 'admin' && (
                  <Link href="/ui/products">
                    <button className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                      + Add Product
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {products.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                <h2>No products found</h2>
                <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleWishlist}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
}: {
  product: Product;
  onAddToCart: (id: string) => void;
  onAddToWishlist: (id: string) => void;
}) {
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
        {Math.random() > 0.7 && <div className="product-badge">Sale</div>}
        <div className="product-actions">
          <button
            className="product-action-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToWishlist(product._id);
            }}
            title="Add to Wishlist"
          >
            ❤️
          </button>
          <button
            className="product-action-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product._id);
            }}
            title="Add to Cart"
          >
            🛒
          </button>
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div>
            <span className="product-price">${product.price.toFixed(2)}</span>
            {Math.random() > 0.7 && (
              <span className="product-price-old">${(product.price * 1.5).toFixed(2)}</span>
            )}
          </div>
          {product.averageRating && (
            <div className="product-rating">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.averageRating!) ? 'star' : 'star-empty'}>
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
