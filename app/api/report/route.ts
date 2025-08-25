import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CrimeReportService } from '@/lib/services/crime-report-service';
import { CrimeReportRequest } from '@/lib/types/crime-report';

const crimeReportService = new CrimeReportService();

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Crime report API route called');
    
    // Get authenticated user from Clerk
    const { userId } = await auth();
    console.log('🔐 Auth check - userId:', userId ? 'Found' : 'Not found');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('📋 Parsing form data...');
    const formData = await request.formData();
    
    // Extract form data
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as 'low' | 'medium' | 'high' | 'critical';
    const mediaFiles = formData.getAll('mediaFiles') as File[];
    
    console.log('📍 Form data extracted:', {
      location: location?.substring(0, 50) + '...',
      description: description?.substring(0, 50) + '...',
      category,
      priority,
      mediaFilesCount: mediaFiles.length
    });
    
    // Extract coordinates if available
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    
    // Validate required fields
    if (!location || !description || !category || !priority) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: location, description, category, and priority are required' },
        { status: 400 }
      );
    }

    if (mediaFiles.length === 0) {
      console.log('❌ No media files provided');
      return NextResponse.json(
        { error: 'At least one media file is required' },
        { status: 400 }
      );
    }

    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    
    for (const file of mediaFiles) {
      if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        console.log('❌ Invalid file type:', file.type);
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only images and videos are allowed.` },
          { status: 400 }
        );
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log('❌ File too large:', file.size);
        return NextResponse.json(
          { error: `File "${file.name}" is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }
    }

    console.log('✅ Validation passed, creating report request...');

    // Create crime report request
    const crimeReportRequest: CrimeReportRequest = {
      location,
      description,
      mediaFiles,
      category,
      priority,
      coordinates: latitude && longitude ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      } : undefined
    };

    console.log('🚀 Submitting report to service...');
    
    // Submit the report using Clerk user ID - wrap in try-catch for specific error handling
    let crimeReport;
    try {
      crimeReport = await crimeReportService.submitReport(crimeReportRequest, userId);
      console.log('✅ Report submitted successfully');
    } catch (serviceError) {
      console.error('❌ CrimeReportService error:', serviceError);
      
      // Log the full error for debugging
      if (serviceError instanceof Error) {
        console.error('Error name:', serviceError.name);
        console.error('Error message:', serviceError.message);
        console.error('Error stack:', serviceError.stack);
      }
      
      // Return a more specific error message
      return NextResponse.json(
        { 
          error: 'Failed to process crime report',
          details: serviceError instanceof Error ? serviceError.message : 'Unknown error in crime report service'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report: crimeReport,
      message: 'Crime report submitted successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error in crime report API:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Always return JSON, never let it fall through to HTML error pages
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('📋 Fetching all crime reports...');
    const reports = await crimeReportService.getAllReports();
    console.log('✅ Found', reports.length, 'reports');
    
    return NextResponse.json({
      success: true,
      reports,
      count: reports.length
    });
  } catch (error) {
    console.error('❌ Error fetching crime reports:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch crime reports',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}