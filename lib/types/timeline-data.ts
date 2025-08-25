export interface TimelineDataPoint {
  id: string
  latitude: number
  longitude: number
  crimeGroupName: string
  year: number
  month: number
  districtName: string
  date: string
  timestamp: number
}

export interface TimelineFilters {
  districts: string[]
  crimeGroups: string[]
  yearRange: [number, number]
  monthRange: [number, number]
  dateRange: { start: string; end: string }
}

export interface TimelineStats {
  totalDataPoints: number
  dateRange: { start: string; end: string }
  districtsCovered: number
  crimeTypesCovered: number
  dataQuality: number
}

export interface CrimeTrend {
  crimeGroup: string
  trend: 'increasing' | 'decreasing' | 'stable'
  percentageChange: number
  monthlyData: { month: string; count: number }[]
}

export interface DistrictHotspot {
  district: string
  crimeCount: number
  crimeRate: number
  trend: number
  coordinates: { lat: number; lng: number }
  topCrimeTypes: string[]
}

export interface SeasonalPattern {
  month: number
  monthName: string
  averageCrimes: number
  crimeTypes: Record<string, number>
  trend: 'peak' | 'low' | 'average'
}

export interface MonthPrediction {
  month: string
  predictedCrimes: number
  confidence: number
  topDistricts: string[]
  topCrimeTypes: string[]
  riskLevel: 'high' | 'medium' | 'low'
}

export interface TimelineAnalysis {
  totalCrimes: number
  crimeTrends: CrimeTrend[]
  districtHotspots: DistrictHotspot[]
  seasonalPatterns: SeasonalPattern[]
  predictionAccuracy: number
  nextMonthPrediction: MonthPrediction
}

export interface APIResponse<T> {
  data: T
  status: 'success' | 'error'
  message: string
  timestamp: string
}
