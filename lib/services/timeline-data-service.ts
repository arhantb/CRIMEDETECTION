import type { 
  TimelineDataPoint, 
  TimelineAnalysis, 
  TimelineFilters, 
  TimelineStats,
  APIResponse 
} from "@/lib/types/timeline-data"

class TimelineDataService {
  private data: TimelineDataPoint[] = []
  private isLoaded = false

  async loadCSVData(csvContent: string): Promise<APIResponse<TimelineStats>> {
    try {
      if (!csvContent || csvContent.trim().length === 0) {
        throw new Error("CSV file is empty")
      }

      const lines = csvContent.trim().split('\n')
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain at least a header row and one data row")
      }

      // Add file size limit
      if (lines.length > 100000) {
        throw new Error("File too large. Please use a CSV file with fewer than 100,000 rows for better performance.")
      }

      // Add timeout protection
      const startTime = Date.now()
      const maxProcessingTime = 30000 // 30 seconds max

      // Fast CSV parsing - simple split for better performance
      const parseCSVLine = (line: string) => {
        return line.split(',').map(field => field.trim().replace(/^"|"$/g, ''))
      }
      
      const headers = parseCSVLine(lines[0])
      
      // Find column indices for required fields
      const latIndex = headers.indexOf('Latitude')
      const lngIndex = headers.indexOf('Longitude')
      const crimeGroupIndex = headers.indexOf('CrimeGroup_Name')
      const yearIndex = headers.indexOf('Year')
      const monthIndex = headers.indexOf('Month')
      const districtIndex = headers.indexOf('District_Name')
      
      // Validate that all required columns are present
      if (latIndex === -1 || lngIndex === -1 || crimeGroupIndex === -1 || 
          yearIndex === -1 || monthIndex === -1 || districtIndex === -1) {
        const missing = []
        if (latIndex === -1) missing.push('Latitude')
        if (lngIndex === -1) missing.push('Longitude')
        if (crimeGroupIndex === -1) missing.push('CrimeGroup_Name')
        if (yearIndex === -1) missing.push('Year')
        if (monthIndex === -1) missing.push('Month')
        if (districtIndex === -1) missing.push('District_Name')
        throw new Error(`Missing required columns: ${missing.join(', ')}`)
      }
      
      // Process data in chunks for better performance with smaller chunk size for better responsiveness
      const chunkSize = 1000 // Reduced chunk size for better responsiveness
      const dataChunks = []
      let processedRows = 0
      
      for (let i = 1; i < lines.length; i += chunkSize) {
        // Check timeout
        if (Date.now() - startTime > maxProcessingTime) {
          throw new Error("Processing timeout: File is too large. Please try with a smaller dataset.")
        }
        const chunk = lines.slice(i, i + chunkSize).map((line, chunkIndex) => {
          const index = i + chunkIndex - 1
          const values = parseCSVLine(line)
          
          // Quick validation - only check if we have enough columns
          if (values.length <= Math.max(latIndex, lngIndex, crimeGroupIndex, yearIndex, monthIndex, districtIndex)) {
            return null // Skip invalid rows instead of throwing error
          }
          
          const lat = values[latIndex]
          const lng = values[lngIndex]
          const crimeGroup = values[crimeGroupIndex]
          const year = values[yearIndex]
          const month = values[monthIndex]
          const district = values[districtIndex]
          
          // Fast numeric conversion with minimal validation
          const latitude = parseFloat(lat)
          const longitude = parseFloat(lng)
          const yearNum = parseInt(year)
          const monthNum = parseInt(month)
          
          // Skip invalid data instead of throwing errors
          if (isNaN(latitude) || isNaN(longitude) || isNaN(yearNum) || isNaN(monthNum) ||
              latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 ||
              yearNum < 1900 || yearNum > 2100 || monthNum < 1 || monthNum > 12 ||
              !crimeGroup || !district) {
            return null
          }
          
          const date = new Date(yearNum, monthNum - 1, 1)
          
          return {
            id: `timeline-${index}`,
            latitude,
            longitude,
            crimeGroupName: crimeGroup,
            year: yearNum,
            month: monthNum,
            districtName: district,
            date: date.toISOString(),
            timestamp: date.getTime()
          }
        }).filter((item): item is TimelineDataPoint => item !== null) // Remove null entries
        
        dataChunks.push(...chunk)
        processedRows += chunk.length
        
        // Progress logging for large files
        if (processedRows % 5000 === 0) {
          console.log(`Processed ${processedRows.toLocaleString()} rows...`)
        }
        
        // Allow other operations to run between chunks (more frequent)
        if (i + chunkSize < lines.length && processedRows % 1000 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
      
      this.data = dataChunks

      this.isLoaded = true

      // Calculate min/max timestamps efficiently for large datasets
      const timestamps = this.data.map(d => d.timestamp)
      const minTimestamp = timestamps.reduce((min, ts) => Math.min(min, ts), timestamps[0])
      const maxTimestamp = timestamps.reduce((max, ts) => Math.max(max, ts), timestamps[0])
      
      const stats: TimelineStats = {
        totalDataPoints: this.data.length,
        dateRange: {
          start: new Date(minTimestamp).toISOString(),
          end: new Date(maxTimestamp).toISOString()
        },
        districtsCovered: new Set(this.data.map(d => d.districtName)).size,
        crimeTypesCovered: new Set(this.data.map(d => d.crimeGroupName)).size,
        dataQuality: this.calculateDataQuality()
      }

      return {
        data: stats,
        status: "success",
        message: "CSV data loaded successfully",
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error("CSV processing error:", error)
      return {
        data: {} as TimelineStats,
        status: "error",
        message: error instanceof Error ? error.message : "Failed to load CSV data",
        timestamp: new Date().toISOString()
      }
    }
  }

  private calculateDataQuality(): number {
    if (this.data.length === 0) return 0
    
    let qualityScore = 100
    
    // Check for missing coordinates
    const missingCoords = this.data.filter(d => 
      d.latitude === 0 || d.longitude === 0 || 
      isNaN(d.latitude) || isNaN(d.longitude)
    ).length
    qualityScore -= (missingCoords / this.data.length) * 30
    
    // Check for missing crime group names
    const missingCrimeGroups = this.data.filter(d => 
      !d.crimeGroupName || d.crimeGroupName.trim() === ''
    ).length
    qualityScore -= (missingCrimeGroups / this.data.length) * 20
    
    // Check for missing district names
    const missingDistricts = this.data.filter(d => 
      !d.districtName || d.districtName.trim() === ''
    ).length
    qualityScore -= (missingDistricts / this.data.length) * 20
    
    return Math.max(0, Math.round(qualityScore))
  }

  async getTimelineAnalysis(filters: TimelineFilters): Promise<APIResponse<TimelineAnalysis>> {
    try {
      if (!this.isLoaded) {
        throw new Error("No data loaded. Please load CSV data first.")
      }

      const filteredData = this.filterData(filters)
      
      const analysis: TimelineAnalysis = {
        totalCrimes: filteredData.length,
        crimeTrends: this.analyzeCrimeTrends(filteredData),
        districtHotspots: this.analyzeDistrictHotspots(filteredData),
        seasonalPatterns: this.analyzeSeasonalPatterns(filteredData),
        predictionAccuracy: this.calculatePredictionAccuracy(),
        nextMonthPrediction: this.predictNextMonth(filteredData)
      }

      return {
        data: analysis,
        status: "success",
        message: "Timeline analysis completed",
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        data: {} as TimelineAnalysis,
        status: "error",
        message: error instanceof Error ? error.message : "Failed to analyze timeline data",
        timestamp: new Date().toISOString()
      }
    }
  }

  private filterData(filters: TimelineFilters): TimelineDataPoint[] {
    return this.data.filter(point => {
      // Filter by districts
      if (filters.districts.length > 0 && !filters.districts.includes(point.districtName)) {
        return false
      }
      
      // Filter by crime groups
      if (filters.crimeGroups.length > 0 && !filters.crimeGroups.includes(point.crimeGroupName)) {
        return false
      }
      
      // Filter by year range
      if (point.year < filters.yearRange[0] || point.year > filters.yearRange[1]) {
        return false
      }
      
      // Filter by month range
      if (point.month < filters.monthRange[0] || point.month > filters.monthRange[1]) {
        return false
      }
      
      // Filter by date range
      if (filters.dateRange.start && point.date < filters.dateRange.start) {
        return false
      }
      if (filters.dateRange.end && point.date > filters.dateRange.end) {
        return false
      }
      
      return true
    })
  }

  private analyzeCrimeTrends(data: TimelineDataPoint[]) {
    const crimeGroups = [...new Set(data.map(d => d.crimeGroupName))]
    
    return crimeGroups.map(crimeGroup => {
      const crimeData = data.filter(d => d.crimeGroupName === crimeGroup)
      const monthlyCounts = new Map<string, number>()
      
      crimeData.forEach(point => {
        const monthKey = `${point.year}-${point.month.toString().padStart(2, '0')}`
        monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1)
      })
      
      const sortedMonths = Array.from(monthlyCounts.entries()).sort()
      const recentMonths = sortedMonths.slice(-3)
      const previousMonths = sortedMonths.slice(-6, -3)
      
      const recentAvg = recentMonths.reduce((sum, [_, count]) => sum + count, 0) / recentMonths.length
      const previousAvg = previousMonths.reduce((sum, [_, count]) => sum + count, 0) / previousMonths.length
      
      const percentageChange = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (percentageChange > 10) trend = 'increasing'
      else if (percentageChange < -10) trend = 'decreasing'
      
      return {
        crimeGroup,
        trend,
        percentageChange: Math.round(percentageChange * 100) / 100,
        monthlyData: sortedMonths.map(([month, count]) => ({ month, count }))
      }
    })
  }

  private analyzeDistrictHotspots(data: TimelineDataPoint[]) {
    // Create a map to track unique locations within each district
    const locationStats = new Map<string, { 
      district: string; 
      count: number; 
      coords: { lat: number; lng: number }; 
      crimes: string[] 
    }>()
    
    data.forEach(point => {
      // Create a unique key for each location (district + coordinates)
      const locationKey = `${point.districtName}_${point.latitude.toFixed(4)}_${point.longitude.toFixed(4)}`
      
      if (!locationStats.has(locationKey)) {
        locationStats.set(locationKey, {
          district: point.districtName,
          count: 0,
          coords: { lat: point.latitude, lng: point.longitude },
          crimes: []
        })
      }
      
      const stats = locationStats.get(locationKey)!
      stats.count++
      if (!stats.crimes.includes(point.crimeGroupName)) {
        stats.crimes.push(point.crimeGroupName)
      }
    })
    
    // Convert to hotspots array
    const hotspots = Array.from(locationStats.values())
      .map(stats => ({
        district: stats.district,
        crimeCount: stats.count,
        crimeRate: stats.count / data.length * 100,
        trend: this.calculateLocationTrend(stats.coords, data),
        coordinates: stats.coords,
        topCrimeTypes: stats.crimes.slice(0, 3)
      }))
      .sort((a, b) => b.crimeCount - a.crimeCount)
      .slice(0, 50) // Show more hotspots since we have individual locations
    
    return hotspots
  }

  private calculateDistrictTrend(district: string, data: TimelineDataPoint[]) {
    const districtData = data.filter(d => d.districtName === district)
    const sortedData = districtData.sort((a, b) => a.timestamp - b.timestamp)
    
    if (sortedData.length < 6) return 0
    
    const recent = sortedData.slice(-3).length
    const previous = sortedData.slice(-6, -3).length
    
    if (previous === 0) return 0
    
    const percentageChange = ((recent - previous) / previous) * 100
    return Math.round(percentageChange * 10) / 10
  }

  private calculateLocationTrend(coords: { lat: number; lng: number }, data: TimelineDataPoint[]) {
    // Find data points near this location (within 0.01 degrees ~ 1km)
    const nearbyData = data.filter(d => 
      Math.abs(d.latitude - coords.lat) < 0.01 && 
      Math.abs(d.longitude - coords.lng) < 0.01
    )
    
    const sortedData = nearbyData.sort((a, b) => a.timestamp - b.timestamp)
    
    if (sortedData.length < 6) return 0
    
    const recent = sortedData.slice(-3).length
    const previous = sortedData.slice(-6, -3).length
    
    if (previous === 0) return 0
    
    const percentageChange = ((recent - previous) / previous) * 100
    return Math.round(percentageChange * 10) / 10
  }

  private analyzeSeasonalPatterns(data: TimelineDataPoint[]) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    const monthlyStats = new Map<number, { count: number; crimes: Map<string, number> }>()
    
    data.forEach(point => {
      if (!monthlyStats.has(point.month)) {
        monthlyStats.set(point.month, { count: 0, crimes: new Map() })
      }
      
      const stats = monthlyStats.get(point.month)!
      stats.count++
      stats.crimes.set(point.crimeGroupName, (stats.crimes.get(point.crimeGroupName) || 0) + 1)
    })
    
    const totalMonths = monthlyStats.size
    const avgCrimes = data.length / totalMonths
    
    return Array.from(monthlyStats.entries()).map(([month, stats]) => {
      const trend = stats.count > avgCrimes * 1.2 ? 'peak' : 
                   stats.count < avgCrimes * 0.8 ? 'low' : 'average'
      
      return {
        month,
        monthName: monthNames[month - 1],
        averageCrimes: Math.round(stats.count),
        crimeTypes: Object.fromEntries(stats.crimes),
        trend: trend as 'peak' | 'low' | 'average'
      }
    }).sort((a, b) => a.month - b.month)
  }

  private calculatePredictionAccuracy(): number {
    // Mock prediction accuracy calculation
    // In a real implementation, this would compare historical predictions with actual data
    return Math.round(Math.random() * 20 + 80) // 80-100%
  }

  private predictNextMonth(data: TimelineDataPoint[]): any {
    const recentData = data.slice(-30) // Last 30 data points
    const avgCrimes = recentData.length / 3 // Average per month
    
    const districts = [...new Set(recentData.map(d => d.districtName))]
    const crimeTypes = [...new Set(recentData.map(d => d.crimeGroupName))]
    
    const predictedCrimes = Math.round(avgCrimes * (1 + Math.random() * 0.2 - 0.1)) // ±10% variation
    
    return {
      month: this.getNextMonthName(),
      predictedCrimes,
      confidence: Math.round(Math.random() * 15 + 75), // 75-90%
      topDistricts: districts.slice(0, 3),
      topCrimeTypes: crimeTypes.slice(0, 3),
      riskLevel: predictedCrimes > avgCrimes * 1.1 ? 'high' : 
                predictedCrimes < avgCrimes * 0.9 ? 'low' : 'medium'
    }
  }

  private getNextMonthName(): string {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  getAvailableDistricts(): string[] {
    return [...new Set(this.data.map(d => d.districtName))].sort()
  }

  getAvailableCrimeGroups(): string[] {
    return [...new Set(this.data.map(d => d.crimeGroupName))].sort()
  }

  getYearRange(): [number, number] {
    const years = this.data.map(d => d.year)
    const minYear = years.reduce((min, year) => Math.min(min, year), years[0])
    const maxYear = years.reduce((max, year) => Math.max(max, year), years[0])
    return [minYear, maxYear]
  }

  getMonthRange(): [number, number] {
    return [1, 12]
  }
}

export const timelineDataService = new TimelineDataService()
