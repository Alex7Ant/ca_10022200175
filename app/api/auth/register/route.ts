import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide name, email, and password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['customer', 'seller', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'customer';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const userId = typeof user._id === 'object' && user._id !== null 
      ? user._id.toString() 
      : String(user._id);

    const token = generateToken({
      userId: userId,
      email: user.email,
      role: user.role,
    });

    const userResponse: any = user.toObject();
    if ('password' in userResponse) {
      userResponse.password = undefined;
    }

    return NextResponse.json(
      {
        success: true,
        data: { user: userResponse },
        token,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

