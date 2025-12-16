import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

// GET payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    
    if (!mongoose.Types.ObjectId.isValid(params.paymentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    const payment = await Payment.findById(params.paymentId)
      .populate('order')
      .populate('user', 'name email');
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (user && payment.user.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: payment }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT process payment (fake mobile money processing)
export async function PUT(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.paymentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    const payment = await Payment.findById(params.paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (payment.user.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'process' or 'cancel'

    if (action === 'process') {
      // Simulate mobile money payment processing
      // In a real app, this would call the mobile money API
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      payment.status = 'processing';
      payment.transactionId = transactionId;
      await payment.save();

      // Simulate processing delay (in real app, this would be async)
      setTimeout(async () => {
        // Simulate 95% success rate
        const success = Math.random() > 0.05;
        const updatedPayment = await Payment.findById(payment._id);
        if (updatedPayment) {
          updatedPayment.status = success ? 'completed' : 'failed';
          await updatedPayment.save();

          if (success) {
            // Update order status
            await Order.findByIdAndUpdate(payment.order, { status: 'processing' });
          }
        }
      }, 2000);

      const updatedPayment = await Payment.findById(payment._id)
        .populate('order')
        .populate('user', 'name email');

      return NextResponse.json({
        success: true,
        data: updatedPayment,
        message: 'Payment processing initiated',
      }, { status: 200 });
    } else if (action === 'cancel') {
      payment.status = 'cancelled';
      await payment.save();

      const updatedPayment = await Payment.findById(payment._id)
        .populate('order')
        .populate('user', 'name email');

      return NextResponse.json({
        success: true,
        data: updatedPayment,
        message: 'Payment cancelled',
      }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

