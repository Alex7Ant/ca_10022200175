import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';

// DELETE carts with null userId (cleanup endpoint)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Remove carts with null or undefined userId
    const result = await Cart.deleteMany({ 
      $or: [
        { user: null },
        { user: { $exists: false } }
      ]
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} invalid cart(s)`,
      deletedCount: result.deletedCount,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

