import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database-service';

const databaseService = new DatabaseService();

// Simple admin authentication check
function isAdminAuthenticated(request: NextRequest): boolean {
  // In a real app, you'd check JWT tokens or session cookies
  // For now, we'll check a simple header or query parameter
  const authHeader = request.headers.get('authorization');
  const adminToken = request.nextUrl.searchParams.get('admin_token');
  
  // Check if admin is authenticated (this is a simplified check)
  // In production, implement proper JWT validation
  return authHeader === 'Bearer admin' || adminToken === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

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
