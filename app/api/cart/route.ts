import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';

// GET user's cart
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login to access cart' },
        { status: 401 }
      );
    }

    let cart = await Cart.findOne({ user: user.userId }).populate('items.product');
    
    if (!cart) {
      try {
        cart = await Cart.create({ user: user.userId, items: [] });
      } catch (createError: any) {
        // If cart creation fails due to duplicate key, try to find it again
        if (createError.code === 11000) {
          cart = await Cart.findOne({ user: user.userId }).populate('items.product');
          if (!cart) {
            throw new Error('Failed to create or find cart');
          }
        } else {
          throw createError;
        }
      }
    }

    return NextResponse.json({ success: true, data: cart }, { status: 200 });
  } catch (error: any) {
    console.error('Cart API Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST add item to cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login to add items to cart' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product, quantity } = body;

    if (!product || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Please provide product and quantity' },
        { status: 400 }
      );
    }

    // Verify product exists and has stock
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 400 }
      );
    }

    if (productDoc.stock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: user.userId });
    
    if (!cart) {
      try {
        cart = await Cart.create({
          user: user.userId,
          items: [{ product, quantity }],
        });
      } catch (createError: any) {
        // Handle race condition - cart might have been created by another request
        if (createError.code === 11000) {
          cart = await Cart.findOne({ user: user.userId });
          if (!cart) {
            throw new Error('Failed to create or find cart');
          }
          // Add item to existing cart
          const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === product
          );
          if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
          } else {
            cart.items.push({ product, quantity });
          }
          await cart.save();
        } else {
          throw createError;
        }
      }
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === product
      );

      if (existingItemIndex > -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (productDoc.stock < newQuantity) {
          return NextResponse.json(
            { success: false, error: 'Insufficient stock' },
            { status: 400 }
          );
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ product, quantity });
      }
      
      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    return NextResponse.json({ success: true, data: populatedCart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update cart item quantity
export async function PUT(request: NextRequest) {
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
    const { product, quantity } = body;

    if (!product || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Please provide product and quantity' },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be positive' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: user.userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const productDoc = await Product.findById(product);
      if (!productDoc || productDoc.stock < quantity) {
        return NextResponse.json(
          { success: false, error: 'Insufficient stock' },
          { status: 400 }
        );
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    return NextResponse.json({ success: true, data: populatedCart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE remove item from cart
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

    const cart = await Cart.findOne({ user: user.userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== product
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    return NextResponse.json({ success: true, data: populatedCart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

