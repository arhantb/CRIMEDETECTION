export interface CrimeReport {
  id: string;
  userId: string;
  timestamp: Date;
  location: string;
  description: string;
  mediaUrls: string[];
  mediaType: 'photo' | 'video';
  status: 'pending' | 'verified' | 'rejected';
  aiAnalysis: AIAnalysis;
  humanVerification?: HumanVerification;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AIAnalysis {
  confidence: number;
  crimeType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  riskFactors: string[];
  recommendations: string[];
  extractedEntities: {
    people: string[];
    vehicles: string[];
    weapons: string[];
    locations: string[];
    objects: string[];
  };
}

export interface HumanVerification {
  verifiedBy: string;
  verifiedAt: Date;
  isVerified: boolean;
  notes: string;
  confidence: number;
  requiresFollowUp: boolean;
}

export interface CrimeReportRequest {
  location: string;
  description: string;
  mediaFiles: File[];
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AdminDashboardStats {
  totalReports: number;
  pendingVerification: number;
  verifiedReports: number;
  rejectedReports: number;
  averageResponseTime: number;
  reportsByCategory: Record<string, number>;
  reportsByPriority: Record<string, number>;
}
