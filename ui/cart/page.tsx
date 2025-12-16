'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context';
import { useToast } from '@/lib/toast';
import '../../app/globals.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

interface CartItem {
  product: Product | string;
  quantity: number;
}

interface Cart {
  _id: string;
  items: CartItem[];
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
        showToast('Cart updated', 'success');
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to update cart', 'error');
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart?product=${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
        showToast('Item removed', 'success');
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to remove item', 'error');
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => {
      const product = typeof item.product === 'object' ? item.product : null;
      if (!product) return total;
      return total + product.price * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      showToast('Please fill in all shipping address fields', 'error');
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shippingAddress }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order created! Redirecting to payment...', 'success');
        setTimeout(() => {
          router.push(`/payment/${data.data._id}`);
        }, 1000);
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to checkout', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <nav className="nav">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
          </ul>
        </nav>
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</h1>
            <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>Start shopping to add items to your cart</p>
            <Link href="/shop">
              <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <nav className="nav">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/shop">Shop</Link></li>
          <li><Link href="/ui/cart">Cart ({cart.items.length})</Link></li>
        </ul>
      </nav>
      <div className="container">
        <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem' }}>Shopping Cart</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem' }}>Cart Items</h2>
              {cart.items.map((item, index) => {
                const product = typeof item.product === 'object' ? item.product : null;
                if (!product) return null;
                return (
                  <div key={index} className="product-card" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <div style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                        📦
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
                      <p className="price" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>${product.price.toFixed(2)}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{ padding: '0.5rem', minWidth: '40px' }}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          className="btn btn-secondary"
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          disabled={product.stock < item.quantity + 1}
                          style={{ padding: '0.5rem', minWidth: '40px' }}
                        >
                          +
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => removeItem(product._id)}
                          style={{ marginLeft: 'auto', padding: '0.5rem 1rem' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="price" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ${(product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Order Summary</h2>
              
              {!showCheckout ? (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                      <span>Subtotal:</span>
                      <strong>${calculateTotal().toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                      <span>Shipping:</span>
                      <strong>Free</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', paddingTop: '1rem', borderTop: '2px solid #333' }}>
                      <span>Total:</span>
                      <span className="price">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCheckout(true)}
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <>
                  <h3 style={{ marginBottom: '1rem' }}>Shipping Address</h3>
                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        placeholder="State"
                      />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      placeholder="Country"
                    />
                  </div>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      <span>Total:</span>
                      <span className="price">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowCheckout(false)}
                        style={{ flex: 1 }}
                      >
                        Back
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleCheckout}
                        style={{ flex: 2 }}
                      >
                        Create Order & Pay
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
