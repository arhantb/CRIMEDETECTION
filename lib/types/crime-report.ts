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
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  userPublicKey: string;
}

export interface AIAnalysis {
  confidence: number;
  crimeType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
  requiresFolLOWUp: boolean;
}

export interface CrimeReportRequest {
  location: string;
  description: string;
  mediaFiles: File[];
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
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
