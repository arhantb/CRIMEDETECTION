import { prisma } from '../prisma';
import { CrimeReport, AIAnalysis, HumanVerification, CrimeReportRequest } from '../types/crime-report';

export class DatabaseService {
  // Create a new crime report
  async createCrimeReport(request: CrimeReportRequest, userId: string): Promise<CrimeReport> {
    try {
      // First, create or get the user
      const user = await this.getOrCreateUser(userId);
      
      // Create the crime report
      const crimeReport = await prisma.crimeReport.create({
        data: {
          userId: user.id,
          location: request.location,
          description: request.description,
          mediaUrls: [], // Will be updated after media processing
          mediaType: this.determineMediaType(request.mediaFiles[0]),
          priority: request.priority.toUpperCase() as any,
          category: request.category,
          status: 'PENDING',
          aiAnalysis: {
            create: {
              confidence: 0,
              crimeType: 'Unknown',
              severity: 'LOW',
              description: 'Analysis pending',
              riskFactors: [],
              recommendations: [],
              people: [],
              vehicles: [],
              weapons: [],
              locations: [],
              objects: []
            }
          }
        },
        include: {
          aiAnalysis: true,
          user: true
        }
      });

      // Convert to our CrimeReport type
      return this.mapPrismaToCrimeReport(crimeReport);
    } catch (error) {
      console.error('Error creating crime report:', error);
      
      // If database is not available, create a mock response for development
      if (error instanceof Error && error.message.includes('database')) {
        console.log('Database not available, using mock response for development');
        return this.createMockCrimeReport(request, userId);
      }
      
      throw new Error('Failed to create crime report');
    }
  }

  // Get all crime reports
  async getAllCrimeReports(): Promise<CrimeReport[]> {
    try {
      const reports = await prisma.crimeReport.findMany({
        include: {
          aiAnalysis: true,
          humanVerification: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reports.map(this.mapPrismaToCrimeReport);
    } catch (error) {
      console.error('Error fetching crime reports:', error);
      
      // If database is not available, return mock data for development
      if (error instanceof Error && error.message.includes('database')) {
        console.log('Database not available, using mock data for development');
        return this.getMockCrimeReports();
      }
      
      throw new Error('Failed to fetch crime reports');
    }
  }

  // Get crime report by ID
  async getCrimeReportById(id: string): Promise<CrimeReport | null> {
    try {
      const report = await prisma.crimeReport.findUnique({
        where: { id },
        include: {
          aiAnalysis: true,
          humanVerification: true,
          user: true
        }
      });

      return report ? this.mapPrismaToCrimeReport(report) : null;
    } catch (error) {
      console.error('Error fetching crime report:', error);
      throw new Error('Failed to fetch crime report');
    }
  }

  // Update crime report
  async updateCrimeReport(id: string, updates: Partial<CrimeReport>): Promise<CrimeReport | null> {
    try {
      const report = await prisma.crimeReport.update({
        where: { id },
        data: {
          ...(updates.location && { location: updates.location }),
          ...(updates.description && { description: updates.description }),
          ...(updates.status && { status: updates.status }),
          ...(updates.priority && { priority: updates.priority }),
          ...(updates.category && { category: updates.category }),
          ...(updates.mediaUrls && { mediaUrls: updates.mediaUrls }),
          ...(updates.mediaType && { mediaType: updates.mediaType }),
          ...(updates.latitude !== undefined && { latitude: updates.latitude }),
          ...(updates.longitude !== undefined && { longitude: updates.longitude }),
          ...(updates.aiAnalysis && {
            aiAnalysis: {
              upsert: {
                create: {
                  confidence: updates.aiAnalysis.confidence,
                  crimeType: updates.aiAnalysis.crimeType,
                  severity: updates.aiAnalysis.severity,
                  description: updates.aiAnalysis.description,
                  riskFactors: updates.aiAnalysis.riskFactors,
                  recommendations: updates.aiAnalysis.recommendations,
                  people: updates.aiAnalysis.extractedEntities.people,
                  vehicles: updates.aiAnalysis.extractedEntities.vehicles,
                  weapons: updates.aiAnalysis.extractedEntities.weapons,
                  locations: updates.aiAnalysis.extractedEntities.locations,
                  objects: updates.aiAnalysis.extractedEntities.objects
                },
                update: {
                  confidence: updates.aiAnalysis.confidence,
                  crimeType: updates.aiAnalysis.crimeType,
                  severity: updates.aiAnalysis.severity,
                  description: updates.aiAnalysis.description,
                  riskFactors: updates.aiAnalysis.riskFactors,
                  recommendations: updates.aiAnalysis.recommendations,
                  people: updates.aiAnalysis.extractedEntities.people,
                  vehicles: updates.aiAnalysis.extractedEntities.vehicles,
                  weapons: updates.aiAnalysis.extractedEntities.weapons,
                  locations: updates.aiAnalysis.extractedEntities.locations,
                  objects: updates.aiAnalysis.extractedEntities.objects
                }
              }
            }
          })
        },
        include: {
          aiAnalysis: true,
          humanVerification: true,
          user: true
        }
      });

      return this.mapPrismaToCrimeReport(report);
    } catch (error) {
      console.error('Error updating crime report:', error);
      throw new Error('Failed to update crime report');
    }
  }

  // Verify crime report
  async verifyCrimeReport(
    reportId: string, 
    adminId: string, 
    isVerified: boolean, 
    notes: string
  ): Promise<CrimeReport | null> {
    try {
      // First, create or get the admin user
      const admin = await this.getOrCreateUser(adminId, 'ADMIN');
      
      // Update the crime report status
      const report = await prisma.crimeReport.update({
        where: { id: reportId },
        data: {
          status: isVerified ? 'VERIFIED' : 'REJECTED',
          humanVerification: {
            create: {
              verifiedBy: admin.id,
              isVerified,
              notes,
              confidence: isVerified ? 95 : 0,
              requiresFollowUp: !isVerified
            }
          }
        },
        include: {
          aiAnalysis: true,
          humanVerification: true,
          user: true
        }
      });

      return this.mapPrismaToCrimeReport(report);
    } catch (error) {
      console.error('Error verifying crime report:', error);
      throw new Error('Failed to verify crime report');
    }
  }

  // Get reports by status
  async getReportsByStatus(status: string): Promise<CrimeReport[]> {
    try {
      const reports = await prisma.crimeReport.findMany({
        where: { status: status as any },
        include: {
          aiAnalysis: true,
          humanVerification: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reports.map(this.mapPrismaToCrimeReport);
    } catch (error) {
      console.error('Error fetching reports by status:', error);
      throw new Error('Failed to fetch reports by status');
    }
  }

  // Get reports by priority
  async getReportsByPriority(priority: string): Promise<CrimeReport[]> {
    try {
      const reports = await prisma.crimeReport.findMany({
        where: { priority: priority as any },
        include: {
          aiAnalysis: true,
          humanVerification: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reports.map(this.mapPrismaToCrimeReport);
    } catch (error) {
      console.error('Error fetching reports by priority:', error);
      throw new Error('Failed to fetch reports by priority');
    }
  }

  // Get reports by category
  async getReportsByCategory(category: string): Promise<CrimeReport[]> {
    try {
      const reports = await prisma.crimeReport.findMany({
        where: { category },
        include: {
          aiAnalysis: true,
          humanVerification: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reports.map(this.mapPrismaToCrimeReport);
    } catch (error) {
      console.error('Error fetching reports by category:', error);
      throw new Error('Failed to fetch reports by category');
    }
  }

  // Search reports
  async searchReports(query: string): Promise<CrimeReport[]> {
    try {
      const reports = await prisma.crimeReport.findMany({
        where: {
          OR: [
            { description: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          aiAnalysis: true,
          humanVerification: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reports.map(this.mapPrismaToCrimeReport);
    } catch (error) {
      console.error('Error searching reports:', error);
      throw new Error('Failed to search reports');
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const [
        totalReports,
        pendingReports,
        verifiedReports,
        rejectedReports
      ] = await Promise.all([
        prisma.crimeReport.count(),
        prisma.crimeReport.count({ where: { status: 'PENDING' } }),
        prisma.crimeReport.count({ where: { status: 'VERIFIED' } }),
        prisma.crimeReport.count({ where: { status: 'REJECTED' } })
      ]);

      // Get category breakdown
      const categoryStats = await prisma.crimeReport.groupBy({
        by: ['category'],
        _count: { category: true }
      });

      // Get priority breakdown
      const priorityStats = await prisma.crimeReport.groupBy({
        by: ['priority'],
        _count: { priority: true }
      });

      const reportsByCategory: Record<string, number> = {};
      categoryStats.forEach(stat => {
        reportsByCategory[stat.category] = stat._count.category;
      });

      const reportsByPriority: Record<string, number> = {};
      priorityStats.forEach(stat => {
        reportsByPriority[stat.priority] = stat._count.priority;
      });

      return {
        totalReports,
        pendingVerification: pendingReports,
        verifiedReports,
        rejectedReports,
        averageResponseTime: 0, // TODO: Calculate this
        reportsByCategory,
        reportsByPriority
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  // Helper methods
  private async getOrCreateUser(userId: string, role: 'USER' | 'ADMIN' | 'MODERATOR' = 'USER') {
    try {
      // Try to find existing user
      let user = await prisma.user.findFirst({
        where: { id: userId }
      });

      if (!user) {
        // Create new user if not found
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`, // Placeholder email
            name: `User ${userId}`,
            role
          }
        });
      }

      return user;
    } catch (error) {
      console.error('Error getting/creating user:', error);
      throw new Error('Failed to get/create user');
    }
  }

  private determineMediaType(file: File): 'PHOTO' | 'VIDEO' {
    if (file.type.startsWith('image/')) return 'PHOTO';
    if (file.type.startsWith('video/')) return 'VIDEO';
    return 'PHOTO'; // Default fallback
  }

  // Mock method for development when database is not available
  private createMockCrimeReport(request: CrimeReportRequest, userId: string): CrimeReport {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: mockId,
      userId,
      timestamp: new Date(),
      location: request.location,
      description: request.description,
      mediaUrls: [],
      mediaType: 'photo',
      status: 'pending',
      priority: request.priority,
      category: request.category,
      aiAnalysis: {
        confidence: 0,
        crimeType: 'Unknown',
        severity: 'low',
        description: 'Analysis pending (mock mode)',
        riskFactors: [],
        recommendations: [],
        extractedEntities: {
          people: [],
          vehicles: [],
          weapons: [],
          locations: [],
          objects: []
        }
      }
    };
  }

  // Mock method for getting crime reports when database is not available
  private getMockCrimeReports(): CrimeReport[] {
    return [
      {
        id: 'mock_1',
        userId: 'user_1',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        location: 'Downtown Area',
        description: 'Suspicious activity near the bank',
        mediaUrls: [],
        mediaType: 'photo',
        status: 'pending',
        priority: 'medium',
        category: 'Suspicious Activity',
        aiAnalysis: {
          confidence: 75,
          crimeType: 'Suspicious Behavior',
          severity: 'medium',
          description: 'AI detected potential suspicious activity',
          riskFactors: ['High traffic area', 'Bank location'],
          recommendations: ['Monitor the area', 'Check CCTV footage'],
          extractedEntities: {
            people: ['1 person'],
            vehicles: [],
            weapons: [],
            locations: ['Bank vicinity'],
            objects: []
          }
        }
      },
      {
        id: 'mock_2',
        userId: 'user_2',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        location: 'Park Street',
        description: 'Vandalism on public property',
        mediaUrls: [],
        mediaType: 'photo',
        status: 'verified',
        priority: 'low',
        category: 'Vandalism',
        aiAnalysis: {
          confidence: 90,
          crimeType: 'Property Damage',
          severity: 'low',
          description: 'Confirmed vandalism incident',
          riskFactors: ['Public area', 'Low security'],
          recommendations: ['Install security cameras', 'Increase patrols'],
          extractedEntities: {
            people: [],
            vehicles: [],
            weapons: [],
            locations: ['Public park'],
            objects: ['Damaged bench']
          }
        },
        humanVerification: {
          verifiedBy: 'admin_1',
          verifiedAt: new Date(Date.now() - 86400000),
          isVerified: true,
          notes: 'Confirmed by security footage',
          confidence: 95,
          requiresFollowUp: false
        }
      }
    ];
  }

  private mapPrismaToCrimeReport(prismaReport: any): CrimeReport {
    return {
      id: prismaReport.id,
      userId: prismaReport.userId,
      timestamp: prismaReport.timestamp,
      location: prismaReport.location,
      description: prismaReport.description,
      mediaUrls: prismaReport.mediaUrls,
      mediaType: prismaReport.mediaType.toLowerCase() as 'photo' | 'video',
      status: prismaReport.status.toLowerCase() as 'pending' | 'verified' | 'rejected',
      priority: prismaReport.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
      category: prismaReport.category,
      coordinates: prismaReport.latitude && prismaReport.longitude ? {
        latitude: prismaReport.latitude,
        longitude: prismaReport.longitude
      } : undefined,
      aiAnalysis: prismaReport.aiAnalysis ? {
        confidence: prismaReport.aiAnalysis.confidence,
        crimeType: prismaReport.aiAnalysis.crimeType,
        severity: prismaReport.aiAnalysis.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
        description: prismaReport.aiAnalysis.description,
        riskFactors: prismaReport.aiAnalysis.riskFactors,
        recommendations: prismaReport.aiAnalysis.recommendations,
        extractedEntities: {
          people: prismaReport.aiAnalysis.people,
          vehicles: prismaReport.aiAnalysis.vehicles,
          weapons: prismaReport.aiAnalysis.weapons,
          locations: prismaReport.aiAnalysis.locations,
          objects: prismaReport.aiAnalysis.objects
        }
      } : {
        confidence: 0,
        crimeType: 'Unknown',
        severity: 'low',
        description: 'No analysis available',
        riskFactors: [],
        recommendations: [],
        extractedEntities: {
          people: [],
          vehicles: [],
          weapons: [],
          locations: [],
          objects: []
        }
      },
      humanVerification: prismaReport.humanVerification ? {
        verifiedBy: prismaReport.humanVerification.verifiedBy,
        verifiedAt: prismaReport.humanVerification.verifiedAt,
        isVerified: prismaReport.humanVerification.isVerified,
        notes: prismaReport.humanVerification.notes,
        confidence: prismaReport.humanVerification.confidence,
        requiresFollowUp: prismaReport.humanVerification.requiresFollowUp
      } : undefined
    };
  }
}
