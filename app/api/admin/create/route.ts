import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// POST create admin user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin user already exists',
          data: { email: existingAdmin.email, role: existingAdmin.role }
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin user created successfully',
        data: {
          email: admin.email,
          role: admin.role
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET check if admin exists
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    return NextResponse.json(
      { 
        success: true, 
        exists: !!admin,
        data: admin ? { email: admin.email, role: admin.role } : null
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

