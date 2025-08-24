"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  Brain,
  AlertTriangle,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react"
import { crimeDataService } from "@/lib/services/crime-data-service"
import type { CrimeDataPoint, CrimeFilters } from "@/lib/types/crime-data"

interface CrimeHeatMapProps {
  filters?: CrimeFilters
}

interface AITooltipData {
  prediction: {
    nextMonth: number
    trend: "increasing" | "decreasing" | "stable"
    confidence: number
  }
  anomalies: string[]
  riskFactors: string[]
  aiInsights: string[]
}

export default function CrimeHeatMap({ filters }: CrimeHeatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [crimeData, setCrimeData] = useState<CrimeDataPoint[]>([])
  const [selectedCity, setSelectedCity] = useState<CrimeDataPoint | null>(null)
  const [hoveredCity, setHoveredCity] = useState<CrimeDataPoint | null>(null)
  const [aiTooltip, setAiTooltip] = useState<AITooltipData | null>(null)
  const [mapView, setMapView] = useState({ zoom: 5, center: { lat: 20.5937, lng: 78.9629 } })
  const [showHeatMap, setShowHeatMap] = useState(true)
  const [showMarkers, setShowMarkers] = useState(true)
  const [showAIPredictions, setShowAIPredictions] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)

  useEffect(() => {
    const loadCrimeData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await crimeDataService.getCrimeData(filters)

        if (response.status === "success") {
          setCrimeData(response.data)
        } else {
          setError(response.message || "Failed to load crime data")
        }
      } catch (err) {
        setError("Network error while loading crime data")
      } finally {
        setLoading(false)
      }
    }

    loadCrimeData()
  }, [filters])

  const generateAITooltip = async (city: CrimeDataPoint): Promise<AITooltipData> => {
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      prediction: {
        nextMonth: Math.round(city.crimes * (0.9 + Math.random() * 0.2)),
        trend: Math.random() > 0.5 ? "increasing" : Math.random() > 0.3 ? "decreasing" : "stable",
        confidence: Math.round(75 + Math.random() * 20),
      },
      anomalies: ["Unusual spike in cybercrime reports", "Weekend crime pattern deviation detected"].slice(
        0,
        Math.floor(Math.random() * 2) + 1,
      ),
      riskFactors: [
        "High population density",
        "Economic inequality index: 0.7",
        "Limited police patrol coverage",
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      aiInsights: [
        `${city.city} shows ${Math.random() > 0.5 ? "improving" : "concerning"} crime trends`,
        "AI recommends increased patrol during evening hours",
        "Correlation with economic indicators detected",
      ].slice(0, Math.floor(Math.random() * 2) + 1),
    }
  }

  const handleCityHover = async (city: CrimeDataPoint | null) => {
    setHoveredCity(city)
    if (city) {
      setIsAIAnalyzing(true)
      try {
        const tooltip = await generateAITooltip(city)
        setAiTooltip(tooltip)
      } catch (err) {
        console.error("Failed to generate AI tooltip:", err)
      } finally {
        setIsAIAnalyzing(false)
      }
    } else {
      setAiTooltip(null)
      setIsAIAnalyzing(false)
    }
  }

  const handleZoomIn = () => {
    setMapView((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }))
  }

  const handleZoomOut = () => {
    setMapView((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 1, 3) }))
  }

  const handleReset = () => {
    setMapView({ zoom: 5, center: { lat: 20.5937, lng: 78.9629 } })
    setSelectedCity(null)
    setHoveredCity(null)
    setAiTooltip(null)
  }

  const handleCityClick = async (city: CrimeDataPoint) => {
    setSelectedCity(city)
    setMapView({ zoom: 10, center: { lat: city.lat, lng: city.lng } })

    try {
      const response = await crimeDataService.getCityData(city.id)
      if (response.status === "success" && response.data) {
        setSelectedCity(response.data)
      }
    } catch (err) {
      console.error("Failed to load city details:", err)
    }
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return "bg-red-500"
    if (intensity >= 0.6) return "bg-orange-500"
    if (intensity >= 0.4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 0.8) return "Very High"
    if (intensity >= 0.6) return "High"
    if (intensity >= 0.4) return "Medium"
    return "Low"
  }

  const getAIPredictionColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-red-400"
      case "decreasing":
        return "text-green-400"
      case "stable":
        return "text-blue-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "↗"
      case "decreasing":
        return "↘"
      case "stable":
        return "→"
      default:
        return "→"
    }
  }

  if (loading) {
    return (
      <Card className="ai-glass">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            AI Crime Heat Map
          </CardTitle>
          <CardDescription>Loading crime data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">AI analyzing crime data from multiple sources...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="ai-glass">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Crime Heat Map
          </CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="ai-glass cyber-border-enhanced">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif flex items-center gap-2">
              <div className="relative">
                <Brain className="h-5 w-5 text-primary animate-neural-pulse" />
                <div className="absolute inset-0 h-5 w-5 text-primary/20 animate-ping" />
              </div>
              AI Crime Heat Map
            </CardTitle>
            <CardDescription>
              Interactive AI-powered geographical visualization with predictive analytics
              {crimeData.length > 0 && (
                <span className="ml-2 text-primary animate-pulse">• {crimeData.length} regions analyzed</span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHeatMap(!showHeatMap)}
              className={`ai-filter-chip ${showHeatMap ? "active" : ""}`}
            >
              <Layers className="h-4 w-4 mr-2" />
              {showHeatMap ? "Hide" : "Show"} Heat Map
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMarkers(!showMarkers)}
              className={`ai-filter-chip ${showMarkers ? "active" : ""}`}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {showMarkers ? "Hide" : "Show"} Markers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIPredictions(!showAIPredictions)}
              className={`ai-filter-chip ${showAIPredictions ? "active" : ""}`}
            >
              <Target className="h-4 w-4 mr-2" />
              AI Predictions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="ai-glass hover:animate-hologram-glow bg-transparent"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="ai-glass hover:animate-hologram-glow bg-transparent"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="ai-glass hover:animate-hologram-glow bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* AI Tooltip */}
          {hoveredCity && (
            <div className="absolute top-4 left-4 z-20 ai-glass ai-insight-glow rounded-lg p-4 shadow-2xl max-w-sm animate-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-foreground">AI Analysis</h4>
                {isAIAnalyzing && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                {hoveredCity.city}, {hoveredCity.state}
              </div>

              {aiTooltip && !isAIAnalyzing && (
                <div className="space-y-3">
                  {/* Prediction */}
                  <div className="bg-background/50 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium">Next Month Prediction</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{aiTooltip.prediction.nextMonth.toLocaleString()} crimes</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${getAIPredictionColor(aiTooltip.prediction.trend)}`}>
                          {getTrendIcon(aiTooltip.prediction.trend)} {aiTooltip.prediction.trend}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {aiTooltip.prediction.confidence}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Anomalies */}
                  {aiTooltip.anomalies.length > 0 && (
                    <div className="bg-red-500/10 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                        <span className="text-xs font-medium text-red-400">Anomalies Detected</span>
                      </div>
                      {aiTooltip.anomalies.map((anomaly, index) => (
                        <div key={index} className="text-xs text-red-300">
                          • {anomaly}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Insights */}
                  {aiTooltip.aiInsights.length > 0 && (
                    <div className="bg-primary/10 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">AI Insights</span>
                      </div>
                      {aiTooltip.aiInsights.map((insight, index) => (
                        <div key={index} className="text-xs text-primary/80">
                          • {insight}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Map Container */}
          <div
            ref={mapRef}
            className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-primary/20 relative overflow-hidden animate-hologram-glow"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23e5e7eb' fillOpacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* India Map Outline (Simplified) */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 300"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
            >
              <path
                d="M120 80 L180 70 L220 85 L260 90 L280 110 L290 140 L285 170 L270 200 L250 220 L220 235 L190 240 L160 235 L140 220 L125 200 L115 170 L110 140 L115 110 Z"
                fill="rgba(8, 145, 178, 0.1)"
                stroke="rgba(8, 145, 178, 0.3)"
                strokeWidth="2"
                className="animate-cyber-flicker"
              />
            </svg>

            {/* Heat Map Overlay */}
            {showHeatMap && (
              <div className="absolute inset-0">
                {crimeData.map((point, index) => (
                  <div
                    key={point.id}
                    className="absolute rounded-full opacity-60 animate-neural-pulse"
                    style={{
                      left: `${((point.lng - 68) / (97 - 68)) * 100}%`,
                      top: `${((37 - point.lat) / (37 - 8)) * 100}%`,
                      width: `${20 + point.intensity * 40}px`,
                      height: `${20 + point.intensity * 40}px`,
                      background: `radial-gradient(circle, ${
                        point.intensity >= 0.8
                          ? "rgba(239, 68, 68, 0.6)"
                          : point.intensity >= 0.6
                            ? "rgba(249, 115, 22, 0.6)"
                            : point.intensity >= 0.4
                              ? "rgba(245, 158, 11, 0.6)"
                              : "rgba(34, 197, 94, 0.6)"
                      } 0%, transparent 70%)`,
                      transform: "translate(-50%, -50%)",
                      animationDelay: `${index * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* City Markers */}
            {showMarkers && (
              <div className="absolute inset-0">
                {crimeData.map((point, index) => (
                  <button
                    key={point.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-all duration-300 hover:animate-hologram-glow"
                    style={{
                      left: `${((point.lng - 68) / (97 - 68)) * 100}%`,
                      top: `${((37 - point.lat) / (37 - 8)) * 100}%`,
                    }}
                    onClick={() => handleCityClick(point)}
                    onMouseEnter={() => handleCityHover(point)}
                    onMouseLeave={() => handleCityHover(null)}
                  >
                    <div className="relative">
                      <div
                        className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${getIntensityColor(point.intensity)} animate-pulse-glow`}
                      />
                      {showAIPredictions && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedCity && (
              <div className="absolute bottom-4 left-4 ai-glass ai-insight-glow rounded-lg p-4 shadow-2xl max-w-sm animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-foreground">
                    {selectedCity.city}, {selectedCity.state}
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Crimes:</span>
                    <span className="font-medium">{selectedCity.crimes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Level:</span>
                    <Badge
                      className={`${getIntensityColor(selectedCity.intensity)} text-white border-transparent animate-pulse-glow`}
                    >
                      {getIntensityLabel(selectedCity.intensity)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Population:</span>
                    <span className="text-sm">{(selectedCity.population / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Crime Rate:</span>
                    <span className="text-sm">
                      {((selectedCity.crimes / selectedCity.population) * 100000).toFixed(1)}/100k
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-muted-foreground">Top Crime Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(selectedCity.crimeTypes)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([type, count]) => (
                          <Badge key={type} variant="secondary" className="text-xs animate-pulse-glow">
                            {type}: {count}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-primary/20">
                    <div className="flex items-center gap-2">
                      <Brain className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary font-medium">AI Status: Active Monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Map Legend with AI indicators */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Crime Intensity:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse-glow"></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse-glow"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse-glow"></div>
                  <span className="text-xs">High</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse-glow"></div>
                  <span className="text-xs">Very High</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {showAIPredictions && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                  <span className="text-xs text-primary">AI Predictions Active</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Zoom: {mapView.zoom}x | {crimeData.length} regions | Hover for AI insights
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
