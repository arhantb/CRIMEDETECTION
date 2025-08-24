import { NextRequest, NextResponse } from 'next/server';
import { CrimeReportService } from '@/lib/services/crime-report-service';
import { CrimeReportRequest } from '@/lib/types/crime-report';

const crimeReportService = new CrimeReportService();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as 'low' | 'medium' | 'high' | 'critical';
    const mediaFiles = formData.getAll('mediaFiles') as File[];
    
    // Validate required fields
    if (!location || !description || !category || !priority || mediaFiles.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    
    for (const file of mediaFiles) {
      if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only images and videos are allowed.' },
          { status: 400 }
        );
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }
    }

    // Create crime report request
    const crimeReportRequest: CrimeReportRequest = {
      location,
      description,
      mediaFiles,
      category,
      priority
    };

    // For demonstration, using a mock user ID
    // In production, this would come from authentication
    const userId = 'user_' + Date.now();

    // Submit the report
    const crimeReport = await crimeReportService.submitReport(crimeReportRequest, userId);

    return NextResponse.json({
      success: true,
      report: crimeReport,
      message: 'Crime report submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting crime report:', error);
    return NextResponse.json(
      { error: 'Failed to submit crime report' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reports = await crimeReportService.getAllReports();
    
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
