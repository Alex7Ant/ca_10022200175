'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context';
import { useToast } from '@/lib/toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  averageRating?: number;
  reviewCount?: number;
}

interface Wishlist {
  _id: string;
  productIds: string[];
  products?: Product[];
}

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.data);
        // Fetch product details for wishlist items
        if (data.data.productIds && data.data.productIds.length > 0) {
          fetchProducts(data.data.productIds);
        } else {
          setLoading(false);
        }
      } else {
        showToast(data.error, 'error');
        setLoading(false);
      }
    } catch (err: any) {
      showToast('Failed to load wishlist', 'error');
      setLoading(false);
    }
  };

  const fetchProducts = async (productIds: string[]) => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        const wishlistProducts = data.data.filter((p: Product) => 
          productIds.includes(p._id)
        );
        setProducts(wishlistProducts);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== productId));
        showToast('Removed from wishlist', 'success');
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const addToCart = async (productId: string) => {
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
        showToast('Added to cart!', 'success');
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to add to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div>
        <Header />
        <ToastContainer />
        <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❤️</div>
            <h2 style={{ marginBottom: '1rem' }}>Your wishlist is empty</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--gray-600)' }}>
              Save your favorite products for later!
            </p>
            <Link href="/shop">
              <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Start Shopping
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <ToastContainer />
      
      <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
          My Wishlist ({products.length})
        </h1>
        
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <Link href={`/ui/products/${product._id}`}>
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
              </Link>
              <div className="product-info">
                <Link href={`/ui/products/${product._id}`}>
                  <div className="product-name">{product.name}</div>
                </Link>
                <div className="product-price">${product.price.toFixed(2)}</div>
                {product.averageRating && (
                  <div className="product-rating" style={{ marginTop: '0.5rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.averageRating!) ? 'star' : 'star-empty'}>★</span>
                    ))}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>({product.reviewCount || 0})</span>
                  </div>
                )}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => addToCart(product._id)}
                    style={{ width: '100%' }}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => removeFromWishlist(product._id)}
                    style={{ width: '100%' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

