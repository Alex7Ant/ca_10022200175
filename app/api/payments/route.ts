import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';

// GET all payments
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order');
    
    const query: any = {};
    if (orderId) {
      query.order = orderId;
    }
    if (user && user.role !== 'admin') {
      query.user = user.userId;
    }

    const payments = await Payment.find(query)
      .populate('order')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: payments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create payment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, method, provider, phoneNumber } = body;

    if (!orderId || !method) {
      return NextResponse.json(
        { success: false, error: 'Please provide order ID and payment method' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.user.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment already exists for this order' },
        { status: 400 }
      );
    }

    // Validate mobile money
    if (method === 'mobile_money') {
      if (!provider || !phoneNumber) {
        return NextResponse.json(
          { success: false, error: 'Please provide provider and phone number for mobile money' },
          { status: 400 }
        );
      }
    }

    const payment = await Payment.create({
      order: orderId,
      user: user.userId,
      amount: order.total,
      method,
      provider: method === 'mobile_money' ? provider : undefined,
      phoneNumber: method === 'mobile_money' ? phoneNumber : undefined,
      status: 'pending',
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('order')
      .populate('user', 'name email');

    return NextResponse.json({ success: true, data: populatedPayment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

