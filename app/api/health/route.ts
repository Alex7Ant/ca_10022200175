import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const dbState = mongoose.connection.readyState;
    const dbName = mongoose.connection.db?.databaseName;
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: {
        connected: dbState === 1,
        state: dbState === 1 ? 'connected' : 'disconnected',
        name: dbName || 'unknown',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

