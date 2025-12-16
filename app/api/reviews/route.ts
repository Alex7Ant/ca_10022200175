import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';

// GET all reviews (optional: ?product=productId)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product');
    
    const query: any = {};
    if (productId) {
      query.product = productId;
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new review
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
    const { product, rating, comment } = body;

    if (!product || !rating) {
      return NextResponse.json(
        { success: false, error: 'Please provide product and rating' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 400 }
      );
    }

    const review = await Review.create({
      user: user.userId,
      product,
      rating,
      comment: comment || '',
    });

    // Update product average rating
    await updateProductRating(product);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('product', 'name');

    return NextResponse.json({ success: true, data: populatedReview }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function updateProductRating(productId: string) {
  const reviews = await Review.find({ product: productId });
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: reviews.length,
  });
}

