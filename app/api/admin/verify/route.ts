import { NextRequest, NextResponse } from 'next/server';
import { CrimeReportService } from '@/lib/services/crime-report-service';

const crimeReportService = new CrimeReportService();

export async function POST(request: NextRequest) {
  try {
    const { reportId, adminId, isVerified, notes } = await request.json();
    
    // Validate required fields
    if (!reportId || !adminId || typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the report
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

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: `Report ${isVerified ? 'verified' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('Error verifying crime report:', error);
    return NextResponse.json(
      { error: 'Failed to verify crime report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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
