export interface SatelliteDataPoint {
  id: string
  lat: number
  lng: number
  city: string
  state: string
  nighttimeLights: number // Brightness index 0-1
  economicActivity: number // Economic activity proxy 0-1
  urbanDevelopment: number // Urban development index 0-1
  lightPollution: number // Light pollution level 0-1
  timestamp: string
  satelliteSource: "VIIRS" | "DMSP" | "Landsat" | "Sentinel"
  resolution: number // meters per pixel
}

export interface SatelliteAnalysis {
  region: string
  averageBrightness: number
  economicInequalityIndex: number
  urbanizationRate: number
  crimeCorrelation: number
  developmentTrend: "increasing" | "decreasing" | "stable"
}

export interface NighttimeLightsData {
  coordinates: [number, number]
  brightness: number
  economicProxy: number
  timestamp: string
}

export interface SatelliteOverlaySettings {
  showNighttimeLights: boolean
  showEconomicActivity: boolean
  showUrbanDevelopment: boolean
  showLightPollution: boolean
  overlayOpacity: number
  dataSource: "VIIRS" | "DMSP" | "Combined"
  timeRange: string
}
