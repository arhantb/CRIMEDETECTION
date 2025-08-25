"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  FileText,
  Database,
  Target,
  Zap,
  Activity,
  Shield,
  Eye,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { timelineDataService } from "@/lib/services/timeline-data-service"
import type { 
  TimelineFilters, 
  TimelineAnalysis, 
  TimelineStats,
  CrimeTrend,
  DistrictHotspot,
  SeasonalPattern,
  MonthPrediction
} from "@/lib/types/timeline-data"
import TimelineTrendChart from "./timeline-trend-chart"
import TimelineHeatMap from "./timeline-heat-map"
import LeafletPriorityMap from "./leaflet-priority-map"
import CSVValidator from "./csv-validator"

export default function TimelinePredictionsDashboard() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<TimelineStats | null>(null)
  const [analysis, setAnalysis] = useState<TimelineAnalysis | null>(null)
  const [error, setError] = useState<string>("")
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [availableCrimeGroups, setAvailableCrimeGroups] = useState<string[]>([])
  const [yearRange, setYearRange] = useState<[number, number]>([2020, 2024])
  
  const [filters, setFilters] = useState<TimelineFilters>({
    districts: [],
    crimeGroups: [],
    yearRange: [2020, 2024],
    monthRange: [1, 12],
    dateRange: { start: "", end: "" }
  })

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is CSV by extension or MIME type
      const isCSV = file.name.toLowerCase().endsWith('.csv') || 
                   file.type === "text/csv" || 
                   file.type === "application/csv" ||
                   file.type === ""
      
      if (isCSV) {
        setCsvFile(file)
        setError("")
        
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setCsvContent(content)
        }
        reader.onerror = () => {
          setError("Failed to read the file. Please try again.")
        }
        reader.readAsText(file)
      } else {
        setError("Please select a valid CSV file (.csv extension)")
      }
    } else {
      setError("Please select a file")
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!csvContent) return
    
    setIsLoading(true)
    setError("")
    
    try {
      // Use setTimeout to make the loading feel more responsive
      const response = await Promise.race([
        timelineDataService.loadCSVData(csvContent),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Operation timed out")), 60000) // Increased to 60 seconds
        )
      ]) as any
      
      if (response.status === "success") {
        setStats(response.data)
        setAvailableDistricts(timelineDataService.getAvailableDistricts())
        setAvailableCrimeGroups(timelineDataService.getAvailableCrimeGroups())
        setYearRange(timelineDataService.getYearRange())
        
        // Update filters with available data
        setFilters(prev => ({
          ...prev,
          yearRange: timelineDataService.getYearRange()
        }))
        
        // Perform initial analysis in background
        setTimeout(() => performAnalysis(), 100)
      } else {
        setError(response.message || "Failed to load CSV data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [csvContent])

  const performAnalysis = useCallback(async () => {
    if (!csvContent) return
    
    setIsLoading(true)
    try {
      // Add timeout for analysis
      const response = await Promise.race([
        timelineDataService.getTimelineAnalysis(filters),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Analysis timed out")), 15000)
        )
      ]) as any
      
      if (response.status === "success") {
        setAnalysis(response.data)
      } else {
        setError(response.message || "Failed to analyze data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }, [csvContent, filters])

  useEffect(() => {
    if (csvContent) {
      loadData()
    }
  }, [csvContent, loadData])

  const handleFilterChange = (key: keyof TimelineFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    performAnalysis()
  }

  const handleResetFilters = () => {
    setFilters({
      districts: [],
      crimeGroups: [],
      yearRange: yearRange,
      monthRange: [1, 12],
      dateRange: { start: "", end: "" }
    })
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-500'
      case 'decreasing': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl cyber-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Calendar className="h-8 w-8 text-primary animate-pulse-glow" />
                <div className="absolute inset-0 h-8 w-8 text-primary/20 animate-ping" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Timeline Predictions Dashboard
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary animate-pulse" />
                  Crime Pattern Analysis & Predictive Intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-primary border-primary animate-pulse-glow bg-primary/5">
                <Target className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              {stats && (
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
                  <Database className="h-3 w-3 mr-1" />
                  {stats.totalDataPoints.toLocaleString()} records
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* CSV Upload Section */}
        {!stats && (
          <div className="space-y-6">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Crime Data
                </CardTitle>
                <CardDescription>
                  Upload your places.csv file to begin timeline analysis and predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="csv-upload">CSV File</Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expected columns: Latitude, Longitude, CrimeGroup_Name, Year, Month, District_Name
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>💡 Tip: For testing, try with a smaller sample of your data first</span>
                  </div>
                  {isLoading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Processing CSV file... (This may take a minute for large files)</span>
                    </div>
                  )}
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <CSVValidator />
          </div>
        )}

        {/* Data Quality & Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-top-2 duration-500">
            <Card className="metric-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalDataPoints.toLocaleString()}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Districts Covered</p>
                    <p className="text-2xl font-bold text-foreground">{stats.districtsCovered}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Crime Types</p>
                    <p className="text-2xl font-bold text-foreground">{stats.crimeTypesCovered}</p>
                  </div>
                  <Shield className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
                    <p className="text-2xl font-bold text-foreground">{stats.dataQuality}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={stats.dataQuality} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Panel */}
        {stats && (
          <Card className="mb-6 cyber-border animate-in slide-in-from-top-2 duration-500 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Analysis Filters
              </CardTitle>
              <CardDescription>
                Customize your timeline analysis parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Districts</Label>
                  <Select
                    value={filters.districts.length === 0 ? "all" : filters.districts.join(',')}
                    onValueChange={(value) => handleFilterChange('districts', value === "all" ? [] : (value ? value.split(',') : []))}
                  >
                    <SelectTrigger className="max-h-60 overflow-y-auto">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Districts</SelectItem>
                      {availableDistricts.slice(0, 100).map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                      {availableDistricts.length > 100 && (
                        <SelectItem value="more" disabled>
                          ... and {availableDistricts.length - 100} more districts
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Crime Groups</Label>
                  <Select
                    value={filters.crimeGroups.length === 0 ? "all" : filters.crimeGroups.join(',')}
                    onValueChange={(value) => handleFilterChange('crimeGroups', value === "all" ? [] : (value ? value.split(',') : []))}
                  >
                    <SelectTrigger className="max-h-60 overflow-y-auto">
                      <SelectValue placeholder="All Crime Types" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Crime Types</SelectItem>
                      {availableCrimeGroups.slice(0, 100).map(crime => (
                        <SelectItem key={crime} value={crime}>{crime}</SelectItem>
                      ))}
                      {availableCrimeGroups.length > 100 && (
                        <SelectItem value="more" disabled>
                          ... and {availableCrimeGroups.length - 100} more crime types
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Year Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={filters.yearRange[0]}
                      onChange={(e) => handleFilterChange('yearRange', [parseInt(e.target.value), filters.yearRange[1]])}
                      min={yearRange[0]}
                      max={yearRange[1]}
                    />
                    <span className="flex items-center">to</span>
                    <Input
                      type="number"
                      value={filters.yearRange[1]}
                      onChange={(e) => handleFilterChange('yearRange', [filters.yearRange[0], parseInt(e.target.value)])}
                      min={yearRange[0]}
                      max={yearRange[1]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Month Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={filters.monthRange[0]}
                      onChange={(e) => handleFilterChange('monthRange', [parseInt(e.target.value), filters.monthRange[1]])}
                      min={1}
                      max={12}
                    />
                    <span className="flex items-center">to</span>
                    <Input
                      type="number"
                      value={filters.monthRange[1]}
                      onChange={(e) => handleFilterChange('monthRange', [filters.monthRange[0], parseInt(e.target.value)])}
                      min={1}
                      max={12}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleApplyFilters} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {isLoading && analysis && (
          <Card className="mb-6 cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <div>
                  <p className="font-medium">Updating analysis...</p>
                  <p className="text-sm text-muted-foreground">Processing new filters</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {analysis && !isLoading && (
          <Tabs defaultValue="overview" className="space-y-6 animate-in slide-in-from-top-2 duration-500 delay-200">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends & Map</TabsTrigger>
              <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="cyber-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Crime Trends Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.crimeTrends.slice(0, 5).map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(trend.trend)}
                            <div>
                              <p className="font-medium">{trend.crimeGroup}</p>
                              <p className={`text-sm ${getTrendColor(trend.trend)}`}>
                                {trend.percentageChange > 0 ? '+' : ''}{trend.percentageChange}% change
                              </p>
                            </div>
                          </div>
                          <Badge variant={trend.trend === 'increasing' ? 'destructive' : 'default'}>
                            {trend.trend}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Next Month Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {analysis.nextMonthPrediction.predictedCrimes}
                        </p>
                        <p className="text-sm text-muted-foreground">Predicted Crimes</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Confidence</span>
                        <span className="font-medium">{analysis.nextMonthPrediction.confidence}%</span>
                      </div>
                      <Progress value={analysis.nextMonthPrediction.confidence} />
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Risk Level:</span>
                        <Badge className={getRiskLevelColor(analysis.nextMonthPrediction.riskLevel)}>
                          {analysis.nextMonthPrediction.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Top Districts at Risk:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.nextMonthPrediction.topDistricts.map((district, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {district}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <LeafletPriorityMap data={analysis.districtHotspots} />
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Crime Trends Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimelineTrendChart data={analysis.crimeTrends} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hotspots" className="space-y-6">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    District Hotspots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimelineHeatMap data={analysis.districtHotspots} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="cyber-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Prediction Accuracy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold text-primary">
                        {analysis.predictionAccuracy}%
                      </div>
                      <p className="text-muted-foreground">
                        Historical prediction accuracy based on past data
                      </p>
                      <Progress value={analysis.predictionAccuracy} className="w-full" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="cyber-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Crimes Analyzed:</span>
                        <span className="font-medium">{analysis.totalCrimes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crime Trends Identified:</span>
                        <span className="font-medium">{analysis.crimeTrends.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hotspot Districts:</span>
                        <span className="font-medium">{analysis.districtHotspots.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Seasonal Patterns:</span>
                        <span className="font-medium">{analysis.seasonalPatterns.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
