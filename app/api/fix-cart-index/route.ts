import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// POST to fix the cart index issue
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const cartsCollection = db.collection('carts');
    
    // Step 1: Delete all carts with null user
    const deleteResult = await cartsCollection.deleteMany({ 
      $or: [
        { user: null },
        { user: { $exists: false } }
      ]
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} carts with null user`);

    // Step 2: Check for the problematic index
    const indexes = await cartsCollection.indexes();
    console.log('Current indexes:', indexes);
    
    // Step 3: Drop the old index if it exists
    try {
      await cartsCollection.dropIndex('carts_userId_key');
      console.log('Dropped old carts_userId_key index');
    } catch (err: any) {
      if (err.code !== 27) { // 27 = IndexNotFound
        console.log('Index drop error (might not exist):', err.message);
      }
    }

    try {
      await cartsCollection.dropIndex('user_1');
      console.log('Dropped user_1 index');
    } catch (err: any) {
      if (err.code !== 27) {
        console.log('Index drop error (might not exist):', err.message);
      }
    }

    // Step 4: Create the correct index
    await cartsCollection.createIndex({ user: 1 }, { unique: true, sparse: true });
    console.log('Created new user index with sparse option');

    // Step 5: Verify
    const newIndexes = await cartsCollection.indexes();
    
    return NextResponse.json({
      success: true,
      message: 'Cart index fixed successfully',
      data: {
        deletedCarts: deleteResult.deletedCount,
        indexes: newIndexes,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Fix index error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET to check current state
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const cartsCollection = db.collection('carts');
    
    // Check for null user carts
    const nullUserCarts = await cartsCollection.countDocuments({ 
      $or: [
        { user: null },
        { user: { $exists: false } }
      ]
    });
    
    // Get all indexes
    const indexes = await cartsCollection.indexes();
    
    return NextResponse.json({
      success: true,
      data: {
        nullUserCarts,
        indexes,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Check error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

