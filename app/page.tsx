"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Filter, TrendingUp, Users, Shield, AlertTriangle, Activity, Zap, Database } from "lucide-react"
import CrimeHeatMap from "@/components/crime-heat-map"
import AdvancedFilterPanel from "@/components/advanced-filter-panel"
import SocioEconomicInsights from "@/components/socio-economic-insights"
import EconomicOverlayControls from "@/components/economic-overlay-controls"
import SatelliteDataAnalysis from "@/components/satellite-data-analysis"
import SatelliteOverlayControls from "@/components/satellite-overlay-controls"
import AIHologramPanel from "@/components/ai-hologram-panel"
import AIAssistantButton from "@/components/ai-assistant-button"
import AIInsightPanel from "@/components/ai-insight-panel"
import { useEffect, useState, useCallback } from "react"
import { crimeDataService } from "@/lib/services/crime-data-service"
import type { CrimeStats, CrimeFilters } from "@/lib/types/crime-data"

export default function CrimeDashboard() {
  const [crimeStats, setCrimeStats] = useState<CrimeStats | null>(null)
  const [filters, setFilters] = useState<CrimeFilters>({
    crimeTypes: ["theft", "assault"],
    timeRange: "Last 30 days",
    regions: ["All India"],
    intensityRange: [0, 1],
    dateRange: {
      start: "",
      end: "",
    },
  })
  const [loading, setLoading] = useState(true)
  const [filtersApplied, setFiltersApplied] = useState(false)
  const [economicOverlays, setEconomicOverlays] = useState<any>(null)
  const [satelliteOverlays, setSatelliteOverlays] = useState<any>(null)

  // Calculate active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0
    if (filters.crimeTypes.length > 0) count++
    if (filters.regions.length > 0 && !filters.regions.includes("All India")) count++
    if (filters.timeRange !== "Last 30 days") count++
    if (filters.intensityRange[0] > 0 || filters.intensityRange[1] < 1) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    return count
  }, [filters])

  const loadStats = useCallback(async () => {
    try {
      const response = await crimeDataService.getCrimeStats()
      if (response.status === "success") {
        setCrimeStats(response.data)
      }
    } catch (error) {
      console.error("Failed to load crime stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleFiltersChange = (newFilters: CrimeFilters) => {
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    setFiltersApplied(true)
    // Trigger data refresh with new filters
    loadStats()
  }

  const handleResetFilters = () => {
    const defaultFilters: CrimeFilters = {
      crimeTypes: [],
      timeRange: "Last 30 days",
      regions: ["All India"],
      intensityRange: [0, 1],
      dateRange: { start: "", end: "" },
    }
    setFilters(defaultFilters)
    setFiltersApplied(false)
    loadStats()
  }

  const handleEconomicOverlayChange = (overlays: any) => {
    setEconomicOverlays(overlays)
  }

  const handleSatelliteOverlayChange = (overlays: any) => {
    setSatelliteOverlays(overlays)
  }

  const mockSparklineData = [
    { value: 45, timestamp: "Day 1" },
    { value: 52, timestamp: "Day 2" },
    { value: 48, timestamp: "Day 3" },
    { value: 61, timestamp: "Day 4" },
    { value: 58, timestamp: "Day 5" },
    { value: 67, timestamp: "Day 6" },
    { value: 72, timestamp: "Day 7" },
  ]

  const handleAIQuery = (query: string) => {
    console.log("[v0] AI Query received:", query)
    // Handle AI query processing here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl cyber-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary animate-pulse-glow" />
                <div className="absolute inset-0 h-8 w-8 text-primary/20 animate-ping" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Crime Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary animate-pulse" />
                  India - Real-time Crime Intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-primary border-primary animate-pulse-glow bg-primary/5">
                <Zap className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
              {getActiveFilterCount() > 0 && (
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
                  <Database className="h-3 w-3 mr-1" />
                  {getActiveFilterCount()} filters active
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary/10 hover:border-primary transition-all duration-300 bg-transparent"
              >
                <Filter className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AIHologramPanel
            title="Total Crimes"
            value={crimeStats?.totalCrimes || 24567}
            trend={crimeStats?.trendPercentage || 12.5}
            trendLabel="from last month"
            icon={AlertTriangle}
            color="#ef4444"
            sparklineData={mockSparklineData}
            prediction={{
              nextValue: "26,200",
              confidence: 87,
              direction: "up",
            }}
            loading={loading}
          />

          <AIHologramPanel
            title="Crime Rate"
            value={`${crimeStats?.crimeRate || 2.3}%`}
            trend={-0.8}
            trendLabel="from last month"
            icon={TrendingUp}
            color="#06b6d4"
            sparklineData={mockSparklineData.map((d) => ({ ...d, value: d.value * 0.6 }))}
            prediction={{
              nextValue: "2.1%",
              confidence: 82,
              direction: "down",
            }}
            loading={loading}
          />

          <AIHologramPanel
            title="Active Regions"
            value={crimeStats?.activeRegions || 28}
            trend={0}
            trendLabel="States & UTs"
            icon={MapPin}
            color="#10b981"
            sparklineData={mockSparklineData.map((d) => ({ ...d, value: 28 }))}
            prediction={{
              nextValue: 28,
              confidence: 95,
              direction: "stable",
            }}
            loading={loading}
          />

          <AIHologramPanel
            title="Population Coverage"
            value={`${((crimeStats?.populationCoverage || 1400000000) / 1000000000).toFixed(1)}B`}
            trend={2.1}
            trendLabel="citizens monitored"
            icon={Users}
            color="#8b5cf6"
            sparklineData={mockSparklineData.map((d) => ({ ...d, value: d.value * 1.2 }))}
            prediction={{
              nextValue: "1.42B",
              confidence: 91,
              direction: "up",
            }}
            loading={loading}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters and Overlay Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="cyber-border">
              <AdvancedFilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeFilterCount={getActiveFilterCount()}
              />
            </div>
            <div className="cyber-border">
              <EconomicOverlayControls onOverlayChange={handleEconomicOverlayChange} />
            </div>
            <div className="cyber-border">
              <SatelliteOverlayControls onOverlayChange={handleSatelliteOverlayChange} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="cyber-border">
              <CrimeHeatMap filters={filters} />
            </div>

            {/* Analysis Components */}
            <div className="grid grid-cols-1 gap-6">
              <div className="cyber-border">
                <SocioEconomicInsights />
              </div>
              <div className="cyber-border">
                <SatelliteDataAnalysis />
              </div>
            </div>

            {/* AI Insight Panel */}
            <AIInsightPanel />
          </div>
        </div>
      </div>

      {/* AI Assistant Button */}
      <AIAssistantButton onQuery={handleAIQuery} />
    </div>
  )
}
