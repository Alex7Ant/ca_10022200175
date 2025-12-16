'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context';
import { useToast } from '@/lib/toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

interface Order {
  _id: string;
  total: number;
  items: any[];
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'cash_on_delivery'>('mobile_money');
  const [provider, setProvider] = useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchOrder();
  }, [params.orderId, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        showToast(data.error, 'error');
      }
    } catch (err: any) {
      showToast('Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'mobile_money' && !phoneNumber) {
      showToast('Please enter your phone number', 'error');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCVC)) {
      showToast('Please fill in all card details', 'error');
      return;
    }

    setProcessing(true);

    try {
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: params.orderId,
          method: paymentMethod,
          provider: paymentMethod === 'mobile_money' ? provider : undefined,
          phoneNumber: paymentMethod === 'mobile_money' ? phoneNumber : undefined,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentData.success) {
        showToast(paymentData.error, 'error');
        setProcessing(false);
        return;
      }

      if (paymentMethod !== 'cash_on_delivery') {
        const processRes = await fetch(`/api/payments/${paymentData.data._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'process' }),
        });

        const processData = await processRes.json();
        if (processData.success) {
          showToast('Payment processing...', 'info');
          setTimeout(() => {
            showToast('Payment completed successfully!', 'success');
            setTimeout(() => {
              router.push(`/ui/orders/${params.orderId}`);
            }, 2000);
          }, 3000);
        } else {
          showToast(processData.error, 'error');
          setProcessing(false);
        }
      } else {
        showToast('Order confirmed! Payment on delivery.', 'success');
        setTimeout(() => {
          router.push(`/ui/orders/${params.orderId}`);
        }, 2000);
      }
    } catch (err: any) {
      showToast('Payment failed. Please try again.', 'error');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading payment...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Header />
        <div className="container">
          <div className="error">Order not found</div>
          <Link href="/ui/orders">
            <button className="btn btn-primary">Back to Orders</button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = order.total;
  const shipping = 16.00;
  const total = subtotal + shipping;

  return (
    <div>
      <ToastContainer />
      <Header />
      
      <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Complete Your Order</h1>
        
        {/* Checkout Progress */}
        <div className="checkout-progress">
          <div className="progress-step completed">
            <div className="progress-circle">✓</div>
            <div className="progress-label">Review Order</div>
          </div>
          <div className="progress-step active">
            <div className="progress-circle">2</div>
            <div className="progress-label">Payment</div>
          </div>
          <div className="progress-step">
            <div className="progress-circle">3</div>
            <div className="progress-label">Confirmation</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Order Summary */}
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Order Summary</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              {order.items.map((item: any, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
                  <div style={{ width: '60px', height: '60px', background: 'var(--gray-200)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {typeof item.product === 'object' && item.product.image ? (
                      <img src={item.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>
                      {typeof item.product === 'object' ? item.product.name : 'Product'}
                    </div>
                    <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: '700' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: '1rem', borderTop: '2px solid var(--gray-300)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Shipping:</span>
                <strong>${shipping.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', paddingTop: '1rem', borderTop: '2px solid var(--gray-300)', marginTop: '1rem' }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Payment Method</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px solid var(--gray-300)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: paymentMethod === 'card' ? 'var(--gray-50)' : 'var(--white)' }}
                onClick={() => setPaymentMethod('card')}
              >
                <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                <span style={{ fontSize: '1.5rem' }}>💳</span>
                <span style={{ fontWeight: '600' }}>Visa Card</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px solid var(--gray-300)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: paymentMethod === 'card' ? 'var(--gray-50)' : 'var(--white)' }}
                onClick={() => setPaymentMethod('card')}
              >
                <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                <span style={{ fontSize: '1.5rem' }}>💳</span>
                <span style={{ fontWeight: '600' }}>Master Card</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px solid var(--gray-300)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: paymentMethod === 'mobile_money' ? 'var(--gray-50)' : 'var(--white)' }}
                onClick={() => setPaymentMethod('mobile_money')}
              >
                <input type="radio" name="payment" checked={paymentMethod === 'mobile_money'} onChange={() => setPaymentMethod('mobile_money')} />
                <span style={{ fontSize: '1.5rem' }}>📱</span>
                <span style={{ fontWeight: '600' }}>MTN Mobile Money</span>
              </label>
            </div>

            {paymentMethod === 'mobile_money' && (
              <div>
                <div className="form-group">
                  <label>Select Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                  >
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="vodafone">Vodafone Cash</option>
                    <option value="airteltigo">AirtelTigo Money</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0501234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handlePayment}
              disabled={processing}
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem' }}
            >
              {processing ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  Processing...
                </>
              ) : (
                `Place Order - $${total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
