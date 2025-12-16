import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';

// GET user's wishlist
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let wishlist = await Wishlist.findOne({ user: user.userId }).populate('products');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: user.userId, products: [] });
    }

    return NextResponse.json({ success: true, data: wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST add product to wishlist
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
    const { product } = body;

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Please provide product ID' },
        { status: 400 }
      );
    }

    // Verify product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 400 }
      );
    }

    let wishlist = await Wishlist.findOne({ user: user.userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: user.userId,
        products: [product],
      });
    } else {
      if (wishlist.products.includes(product as any)) {
        return NextResponse.json(
          { success: false, error: 'Product already in wishlist' },
          { status: 400 }
        );
      }
      wishlist.products.push(product as any);
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

    return NextResponse.json({ success: true, data: populatedWishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Please provide product ID' },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.findOne({ user: user.userId });
    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== product
    );

    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

    return NextResponse.json({ success: true, data: populatedWishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

