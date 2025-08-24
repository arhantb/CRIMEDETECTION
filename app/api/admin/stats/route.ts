import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database-service';

const databaseService = new DatabaseService();

export async function GET() {
  try {
    const stats = await databaseService.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
