'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
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

export default function ProductDetailPage() {
  const params = useParams();
  const { isAuthenticated, token } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'related'>('specs');
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (params.productId) {
      fetchProduct(params.productId as string);
      fetchReviews(params.productId as string);
      fetchRelatedProducts(params.productId as string);
    }
  }, [params.productId]);

  const fetchProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (err: any) {
      showToast('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const res = await fetch(`/api/reviews?product=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const fetchRelatedProducts = async (productId: string) => {
    try {
      const res = await fetch('/api/products?limit=4');
      const data = await res.json();
      if (data.success) {
        setRelatedProducts(data.data.filter((p: Product) => p._id !== productId).slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to fetch related products:', err);
    }
  };

  const handleAddToCart = async () => {
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
        body: JSON.stringify({ product: product!._id, quantity }),
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

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      showToast('Please login to leave a review', 'info');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: product!._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review submitted!', 'success');
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews(product!._id);
        fetchProduct(product!._id);
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to submit review', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="container">
          <div className="error">Product not found</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          {/* Product Image */}
          <div>
            <div className="product-image" style={{ height: '500px', borderRadius: '12px' }}>
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              ) : (
                <span style={{ fontSize: '8rem' }}>📦</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>{product.name}</h1>
            <div className="product-price" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              ${product.price.toFixed(2)}
            </div>
            {product.averageRating && (
              <div className="product-rating" style={{ marginBottom: '1rem' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.averageRating!) ? 'star' : 'star-empty'}>
                    ★
                  </span>
                ))}
                <span style={{ marginLeft: '0.5rem' }}>({product.reviewCount || 0} reviews)</span>
              </div>
            )}
            <p style={{ marginBottom: '2rem', color: 'var(--gray-600)', lineHeight: '1.6' }}>
              {product.description}
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Quantity</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '80px', padding: '0.5rem', textAlign: 'center', border: '2px solid var(--gray-300)', borderRadius: '8px' }}
                  min="1"
                  max={product.stock}
                />
                <button
                  className="btn btn-secondary"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  +
                </button>
                <span style={{ color: 'var(--gray-600)' }}>{product.stock} in stock</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Tabs */}
        <div>
          <div className="product-tabs">
            <button
              className={`tab ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Product Specifications
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
            <button
              className={`tab ${activeTab === 'related' ? 'active' : ''}`}
              onClick={() => setActiveTab('related')}
            >
              Related Products
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'specs' && (
              <div>
                <h3 style={{ marginBottom: '1rem', fontWeight: '700' }}>Product Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <strong>Material:</strong> High Quality Materials
                  </div>
                  <div>
                    <strong>Category:</strong> {typeof product.category === 'object' ? product.category.name : 'N/A'}
                  </div>
                  <div>
                    <strong>Origin:</strong> Handcrafted with Care
                  </div>
                  <div>
                    <strong>Stock:</strong> {product.stock} available
                  </div>
                  <div>
                    <strong>Price:</strong> ${product.price.toFixed(2)}
                  </div>
                  <div>
                    <strong>Care Instructions:</strong> Follow product guidelines
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {isAuthenticated && (
                  <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
                    <div className="form-group">
                      <label>Rating</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setReviewForm({ ...reviewForm, rating })}
                            style={{
                              background: reviewForm.rating >= rating ? '#fbbf24' : 'transparent',
                              border: '2px solid #fbbf24',
                              borderRadius: '4px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '1.5rem',
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Comment</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={handleSubmitReview}>
                      Submit Review
                    </button>
                  </div>
                )}

                <h3 style={{ marginBottom: '1rem', fontWeight: '700' }}>Customer Reviews</h3>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--gray-600)' }}>No reviews yet. Be the first to review!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map((review) => (
                      <div key={review._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <strong>{review.user.name}</strong>
                          <div className="product-rating">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'star' : 'star-empty'}>★</span>
                            ))}
                          </div>
                        </div>
                        {review.comment && <p style={{ color: 'var(--gray-700)' }}>{review.comment}</p>}
                        <small style={{ color: 'var(--gray-500)' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'related' && (
              <div>
                <h3 style={{ marginBottom: '1rem', fontWeight: '700' }}>You May Also Like</h3>
                <div className="products-grid">
                  {relatedProducts.map((relatedProduct) => (
                    <Link key={relatedProduct._id} href={`/ui/products/${relatedProduct._id}`}>
                      <div className="product-card">
                        <div className="product-image">
                          {relatedProduct.image ? (
                            <img src={relatedProduct.image} alt={relatedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div className="product-info">
                          <div className="product-name">{relatedProduct.name}</div>
                          <div className="product-price">${relatedProduct.price.toFixed(2)}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
