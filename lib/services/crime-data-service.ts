import type { CrimeDataPoint, CrimeFilters, CrimeStats, APIResponse } from "@/lib/types/crime-data"

// Enhanced mock data with more realistic crime data structure
const mockCrimeDatabase: CrimeDataPoint[] = [
  {
    id: "delhi-001",
    lat: 28.6139,
    lng: 77.209,
    city: "Delhi",
    state: "Delhi",
    district: "New Delhi",
    crimes: 1250,
    intensity: 0.8,
    crimeTypes: {
      theft: 450,
      assault: 280,
      fraud: 220,
      cybercrime: 180,
      domesticViolence: 80,
      drugOffenses: 30,
      other: 10,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 32900000,
    economicIndicators: {
      gdpPerCapita: 85000,
      unemploymentRate: 4.2,
      literacyRate: 86.3,
      povertyIndex: 0.15,
    },
  },
  {
    id: "mumbai-001",
    lat: 19.076,
    lng: 72.8777,
    city: "Mumbai",
    state: "Maharashtra",
    district: "Mumbai City",
    crimes: 1450,
    intensity: 0.9,
    crimeTypes: {
      theft: 520,
      assault: 310,
      fraud: 280,
      cybercrime: 200,
      domesticViolence: 90,
      drugOffenses: 40,
      other: 10,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 20400000,
    economicIndicators: {
      gdpPerCapita: 95000,
      unemploymentRate: 3.8,
      literacyRate: 89.7,
      povertyIndex: 0.12,
    },
  },
  {
    id: "bangalore-001",
    lat: 12.9716,
    lng: 77.5946,
    city: "Bangalore",
    state: "Karnataka",
    district: "Bangalore Urban",
    crimes: 980,
    intensity: 0.7,
    crimeTypes: {
      theft: 350,
      assault: 200,
      fraud: 180,
      cybercrime: 150,
      domesticViolence: 70,
      drugOffenses: 25,
      other: 5,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 13200000,
    economicIndicators: {
      gdpPerCapita: 78000,
      unemploymentRate: 3.5,
      literacyRate: 88.7,
      povertyIndex: 0.18,
    },
  },
  {
    id: "chennai-001",
    lat: 13.0827,
    lng: 80.2707,
    city: "Chennai",
    state: "Tamil Nadu",
    district: "Chennai",
    crimes: 850,
    intensity: 0.6,
    crimeTypes: {
      theft: 300,
      assault: 180,
      fraud: 150,
      cybercrime: 120,
      domesticViolence: 70,
      drugOffenses: 25,
      other: 5,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 11000000,
    economicIndicators: {
      gdpPerCapita: 72000,
      unemploymentRate: 4.1,
      literacyRate: 90.2,
      povertyIndex: 0.2,
    },
  },
  {
    id: "kolkata-001",
    lat: 22.5726,
    lng: 88.3639,
    city: "Kolkata",
    state: "West Bengal",
    district: "Kolkata",
    crimes: 1100,
    intensity: 0.8,
    crimeTypes: {
      theft: 400,
      assault: 250,
      fraud: 200,
      cybercrime: 140,
      domesticViolence: 80,
      drugOffenses: 25,
      other: 5,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 15700000,
    economicIndicators: {
      gdpPerCapita: 58000,
      unemploymentRate: 5.2,
      literacyRate: 87.1,
      povertyIndex: 0.25,
    },
  },
  {
    id: "hyderabad-001",
    lat: 17.385,
    lng: 78.4867,
    city: "Hyderabad",
    state: "Telangana",
    district: "Hyderabad",
    crimes: 720,
    intensity: 0.5,
    crimeTypes: {
      theft: 250,
      assault: 150,
      fraud: 140,
      cybercrime: 110,
      domesticViolence: 50,
      drugOffenses: 15,
      other: 5,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 10500000,
    economicIndicators: {
      gdpPerCapita: 68000,
      unemploymentRate: 4.0,
      literacyRate: 83.3,
      povertyIndex: 0.22,
    },
  },
  {
    id: "pune-001",
    lat: 18.5204,
    lng: 73.8567,
    city: "Pune",
    state: "Maharashtra",
    district: "Pune",
    crimes: 680,
    intensity: 0.6,
    crimeTypes: {
      theft: 240,
      assault: 140,
      fraud: 130,
      cybercrime: 100,
      domesticViolence: 50,
      drugOffenses: 15,
      other: 5,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 7400000,
    economicIndicators: {
      gdpPerCapita: 75000,
      unemploymentRate: 3.2,
      literacyRate: 86.2,
      povertyIndex: 0.16,
    },
  },
  {
    id: "ahmedabad-001",
    lat: 23.0225,
    lng: 72.5714,
    city: "Ahmedabad",
    state: "Gujarat",
    district: "Ahmedabad",
    crimes: 890,
    intensity: 0.7,
    crimeTypes: {
      theft: 320,
      assault: 190,
      fraud: 160,
      cybercrime: 130,
      domesticViolence: 70,
      drugOffenses: 15,
      other: 5,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 8400000,
    economicIndicators: {
      gdpPerCapita: 70000,
      unemploymentRate: 3.8,
      literacyRate: 85.3,
      povertyIndex: 0.19,
    },
  },
  {
    id: "jaipur-001",
    lat: 26.9124,
    lng: 75.7873,
    city: "Jaipur",
    state: "Rajasthan",
    district: "Jaipur",
    crimes: 540,
    intensity: 0.4,
    crimeTypes: {
      theft: 200,
      assault: 120,
      fraud: 90,
      cybercrime: 70,
      domesticViolence: 45,
      drugOffenses: 10,
      other: 5,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 3900000,
    economicIndicators: {
      gdpPerCapita: 52000,
      unemploymentRate: 4.8,
      literacyRate: 76.4,
      povertyIndex: 0.28,
    },
  },
  {
    id: "nagpur-001",
    lat: 21.1458,
    lng: 79.0882,
    city: "Nagpur",
    state: "Maharashtra",
    district: "Nagpur",
    crimes: 420,
    intensity: 0.3,
    crimeTypes: {
      theft: 150,
      assault: 90,
      fraud: 70,
      cybercrime: 60,
      domesticViolence: 35,
      drugOffenses: 10,
      other: 5,
    },
    timestamp: "2024-01-15T10:30:00Z",
    population: 3100000,
    economicIndicators: {
      gdpPerCapita: 48000,
      unemploymentRate: 5.1,
      literacyRate: 89.5,
      povertyIndex: 0.24,
    },
  },
]

class CrimeDataService {
  private static instance: CrimeDataService
  private cache: Map<string, any> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static getInstance(): CrimeDataService {
    if (!CrimeDataService.instance) {
      CrimeDataService.instance = new CrimeDataService()
    }
    return CrimeDataService.instance
  }

  // Simulate API delay
  private async simulateDelay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Get all crime data with optional filters
  async getCrimeData(filters?: CrimeFilters): Promise<APIResponse<CrimeDataPoint[]>> {
    await this.simulateDelay()

    try {
      let filteredData = [...mockCrimeDatabase]

      if (filters) {
        // Apply crime type filters
        if (filters.crimeTypes.length > 0) {
          filteredData = filteredData.filter((point) => {
            return filters.crimeTypes.some((type) => point.crimeTypes[type as keyof typeof point.crimeTypes] > 0)
          })
        }

        // Apply region filters
        if (filters.regions.length > 0 && !filters.regions.includes("All India")) {
          filteredData = filteredData.filter(
            (point) => filters.regions.includes(point.state) || filters.regions.includes(point.city),
          )
        }

        // Apply intensity range filter
        if (filters.intensityRange) {
          filteredData = filteredData.filter(
            (point) => point.intensity >= filters.intensityRange[0] && point.intensity <= filters.intensityRange[1],
          )
        }
      }

      return {
        data: filteredData,
        status: "success",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        data: [],
        status: "error",
        message: "Failed to fetch crime data",
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Get aggregated crime statistics
  async getCrimeStats(): Promise<APIResponse<CrimeStats>> {
    await this.simulateDelay(200)

    try {
      const totalCrimes = mockCrimeDatabase.reduce((sum, point) => sum + point.crimes, 0)
      const totalPopulation = mockCrimeDatabase.reduce((sum, point) => sum + point.population, 0)
      const crimeRate = (totalCrimes / totalPopulation) * 100000 // per 100k population

      // Find most common crime type
      const crimeTypeTotals = mockCrimeDatabase.reduce(
        (acc, point) => {
          Object.entries(point.crimeTypes).forEach(([type, count]) => {
            acc[type] = (acc[type] || 0) + count
          })
          return acc
        },
        {} as Record<string, number>,
      )

      const mostCommonCrime = Object.entries(crimeTypeTotals).sort(([, a], [, b]) => b - a)[0][0]

      const stats: CrimeStats = {
        totalCrimes,
        crimeRate: Math.round(crimeRate * 100) / 100,
        activeRegions: mockCrimeDatabase.length,
        populationCoverage: totalPopulation,
        trendPercentage: 12.5, // Mock trend data
        mostCommonCrime,
      }

      return {
        data: stats,
        status: "success",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        data: {
          totalCrimes: 0,
          crimeRate: 0,
          activeRegions: 0,
          populationCoverage: 0,
          trendPercentage: 0,
          mostCommonCrime: "unknown",
        },
        status: "error",
        message: "Failed to fetch crime statistics",
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Get crime data for a specific city
  async getCityData(cityId: string): Promise<APIResponse<CrimeDataPoint | null>> {
    await this.simulateDelay(300)

    try {
      const cityData = mockCrimeDatabase.find((point) => point.id === cityId)

      return {
        data: cityData || null,
        status: "success",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        data: null,
        status: "error",
        message: "Failed to fetch city data",
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Get crime trends over time (mock implementation)
  async getCrimeTrends(timeRange: string): Promise<APIResponse<Array<{ date: string; crimes: number }>>> {
    await this.simulateDelay(400)

    try {
      // Generate mock trend data
      const days = timeRange === "Last 30 days" ? 30 : timeRange === "Last 3 months" ? 90 : 365
      const trends = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - i))
        const baseCrimes = 800
        const variation = Math.sin(i / 10) * 200 + Math.random() * 100

        return {
          date: date.toISOString().split("T")[0],
          crimes: Math.round(baseCrimes + variation),
        }
      })

      return {
        data: trends,
        status: "success",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        data: [],
        status: "error",
        message: "Failed to fetch crime trends",
        timestamp: new Date().toISOString(),
      }
    }
  }
}

export const crimeDataService = CrimeDataService.getInstance()
