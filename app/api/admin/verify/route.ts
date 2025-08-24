import { NextRequest, NextResponse } from 'next/server';
import { CrimeReportService } from '@/lib/services/crime-report-service';

const crimeReportService = new CrimeReportService();

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

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!isAdminAuthenticated(request)) {
      console.log('Admin authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    console.log('Admin authenticated, processing verification request');
    
    const { reportId, adminId, isVerified, notes } = await request.json();
    
    console.log('Verification request:', { reportId, adminId, isVerified, notes });
    
    // Validate required fields
    if (!reportId || !adminId || typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the report
    console.log('Calling verifyReport service...');
    const updatedReport = await crimeReportService.verifyReport(
      reportId,
      adminId,
      isVerified,
      notes || ''
    );

    if (!updatedReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    console.log('Report verified successfully:', updatedReport.id);
    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: `Report ${isVerified ? 'verified' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('Error verifying crime report:', error);
    return NextResponse.json(
      { error: 'Failed to verify crime report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let reports;
    
    if (search) {
      reports = await crimeReportService.searchReports(search);
    } else if (status && status !== 'all') {
      reports = await crimeReportService.getReportsByStatus(status as any);
    } else if (priority && priority !== 'all') {
      reports = await crimeReportService.getReportsByPriority(priority as any);
    } else if (category && category !== 'all') {
      reports = await crimeReportService.getReportsByCategory(category);
    } else {
      reports = await crimeReportService.getAllReports();
    }
    
    return NextResponse.json({
      success: true,
      reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Error fetching crime reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crime reports' },
      { status: 500 }
    );
  }
}
