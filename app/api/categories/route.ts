import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const categories = await Category.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Please provide a category name' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    // Create category
    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    return NextResponse.json(
      { success: true, data: category, message: 'Category created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

