export interface CrimeDataPoint {
  id: string
  lat: number
  lng: number
  city: string
  state: string
  district: string
  crimes: number
  intensity: number
  crimeTypes: CrimeTypeBreakdown
  timestamp: string
  population: number
  economicIndicators: EconomicIndicators
}

export interface CrimeTypeBreakdown {
  theft: number
  assault: number
  fraud: number
  cybercrime: number
  domesticViolence: number
  drugOffenses: number
  other: number
}

export interface EconomicIndicators {
  gdpPerCapita: number
  unemploymentRate: number
  literacyRate: number
  povertyIndex: number
}

export interface CrimeFilters {
  crimeTypes: string[]
  timeRange: string
  regions: string[]
  intensityRange: [number, number]
  dateRange: {
    start: string
    end: string
  }
}

export interface CrimeStats {
  totalCrimes: number
  crimeRate: number
  activeRegions: number
  populationCoverage: number
  trendPercentage: number
  mostCommonCrime: string
}

export interface APIResponse<T> {
  data: T
  status: "success" | "error"
  message?: string
  timestamp: string
}
