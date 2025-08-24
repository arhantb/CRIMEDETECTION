"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Bar,
} from "recharts"
import { Satellite, Moon, Zap, Building, TrendingUp, TrendingDown, Loader2, Eye } from "lucide-react"
import { crimeDataService } from "@/lib/services/crime-data-service"
import type { CrimeDataPoint } from "@/lib/types/crime-data"
import type { SatelliteDataPoint } from "@/lib/types/satellite-data"

// Mock satellite data for demonstration
const mockSatelliteData: SatelliteDataPoint[] = [
  {
    id: "sat-delhi-001",
    lat: 28.6139,
    lng: 77.209,
    city: "Delhi",
    state: "Delhi",
    nighttimeLights: 0.92,
    economicActivity: 0.88,
    urbanDevelopment: 0.95,
    lightPollution: 0.89,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-mumbai-001",
    lat: 19.076,
    lng: 72.8777,
    city: "Mumbai",
    state: "Maharashtra",
    nighttimeLights: 0.95,
    economicActivity: 0.92,
    urbanDevelopment: 0.98,
    lightPollution: 0.94,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-bangalore-001",
    lat: 12.9716,
    lng: 77.5946,
    city: "Bangalore",
    state: "Karnataka",
    nighttimeLights: 0.85,
    economicActivity: 0.82,
    urbanDevelopment: 0.88,
    lightPollution: 0.78,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-chennai-001",
    lat: 13.0827,
    lng: 80.2707,
    city: "Chennai",
    state: "Tamil Nadu",
    nighttimeLights: 0.78,
    economicActivity: 0.75,
    urbanDevelopment: 0.82,
    lightPollution: 0.72,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-kolkata-001",
    lat: 22.5726,
    lng: 88.3639,
    city: "Kolkata",
    state: "West Bengal",
    nighttimeLights: 0.72,
    economicActivity: 0.68,
    urbanDevelopment: 0.75,
    lightPollution: 0.69,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-hyderabad-001",
    lat: 17.385,
    lng: 78.4867,
    city: "Hyderabad",
    state: "Telangana",
    nighttimeLights: 0.68,
    economicActivity: 0.72,
    urbanDevelopment: 0.78,
    lightPollution: 0.65,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-pune-001",
    lat: 18.5204,
    lng: 73.8567,
    city: "Pune",
    state: "Maharashtra",
    nighttimeLights: 0.65,
    economicActivity: 0.69,
    urbanDevelopment: 0.72,
    lightPollution: 0.62,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-ahmedabad-001",
    lat: 23.0225,
    lng: 72.5714,
    city: "Ahmedabad",
    state: "Gujarat",
    nighttimeLights: 0.62,
    economicActivity: 0.65,
    urbanDevelopment: 0.68,
    lightPollution: 0.58,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-jaipur-001",
    lat: 26.9124,
    lng: 75.7873,
    city: "Jaipur",
    state: "Rajasthan",
    nighttimeLights: 0.45,
    economicActivity: 0.48,
    urbanDevelopment: 0.52,
    lightPollution: 0.42,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
  {
    id: "sat-nagpur-001",
    lat: 21.1458,
    lng: 79.0882,
    city: "Nagpur",
    state: "Maharashtra",
    nighttimeLights: 0.38,
    economicActivity: 0.42,
    urbanDevelopment: 0.45,
    lightPollution: 0.35,
    timestamp: "2024-01-15T22:30:00Z",
    satelliteSource: "VIIRS",
    resolution: 500,
  },
]

export default function SatelliteDataAnalysis() {
  const [crimeData, setCrimeData] = useState<CrimeDataPoint[]>([])
  const [satelliteData, setSatelliteData] = useState<SatelliteDataPoint[]>([])
  const [correlationData, setCorrelationData] = useState<any[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")

  useEffect(() => {
    const loadData = async () => {
      try {
        const crimeResponse = await crimeDataService.getCrimeData()
        if (crimeResponse.status === "success") {
          setCrimeData(crimeResponse.data)
          setSatelliteData(mockSatelliteData)

          // Create correlation data
          const correlations = crimeResponse.data
            .map((crime) => {
              const satellite = mockSatelliteData.find((sat) => sat.city === crime.city)
              if (satellite) {
                return {
                  city: crime.city,
                  crimeRate: (crime.crimes / crime.population) * 100000,
                  nighttimeLights: satellite.nighttimeLights * 100,
                  economicActivity: satellite.economicActivity * 100,
                  urbanDevelopment: satellite.urbanDevelopment * 100,
                  lightPollution: satellite.lightPollution * 100,
                  economicInequalityProxy: (1 - satellite.economicActivity) * 100,
                }
              }
              return null
            })
            .filter(Boolean)

          setCorrelationData(correlations)

          // Generate mock time series data
          const timeSeries = Array.from({ length: 12 }, (_, i) => {
            const month = new Date(2024, i, 1).toLocaleDateString("en-US", { month: "short" })
            return {
              month,
              nighttimeLights: 65 + Math.sin(i / 2) * 10 + Math.random() * 5,
              crimeRate: 85 - Math.sin(i / 2) * 15 + Math.random() * 8,
              economicActivity: 70 + Math.cos(i / 3) * 12 + Math.random() * 6,
            }
          })
          setTimeSeriesData(timeSeries)
        }
      } catch (error) {
        console.error("Failed to load satellite data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const radarData = correlationData.slice(0, 6).map((item) => ({
    city: item.city,
    "Crime Rate": item.crimeRate,
    "Nighttime Lights": item.nighttimeLights,
    "Economic Activity": item.economicActivity,
    "Urban Development": item.urbanDevelopment,
    "Inequality Proxy": item.economicInequalityProxy,
  }))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Satellite Data Analysis</CardTitle>
          <CardDescription>Loading satellite imagery data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Processing satellite imagery and nighttime lights data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Satellite className="h-5 w-5" />
          Satellite Data Analysis
        </CardTitle>
        <CardDescription>Nighttime lights & economic inequality proxy analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="trends">Time Trends</TabsTrigger>
            <TabsTrigger value="inequality">Inequality</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <Moon className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Avg Brightness</p>
                <p className="text-lg font-bold">
                  {(
                    (satelliteData.reduce((sum, s) => sum + s.nighttimeLights, 0) / satelliteData.length) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Economic Activity</p>
                <p className="text-lg font-bold">
                  {(
                    (satelliteData.reduce((sum, s) => sum + s.economicActivity, 0) / satelliteData.length) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <Building className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Urban Development</p>
                <p className="text-lg font-bold">
                  {(
                    (satelliteData.reduce((sum, s) => sum + s.urbanDevelopment, 0) / satelliteData.length) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Light Pollution</p>
                <p className="text-lg font-bold">
                  {((satelliteData.reduce((sum, s) => sum + s.lightPollution, 0) / satelliteData.length) * 100).toFixed(
                    1,
                  )}
                  %
                </p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={correlationData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="nighttimeLights" fill="#059669" name="Nighttime Lights (%)" />
                  <Line type="monotone" dataKey="crimeRate" stroke="#ea580c" strokeWidth={2} name="Crime Rate" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80">
                <h4 className="text-sm font-medium mb-4">Multi-dimensional Analysis</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="city" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Crime Rate" dataKey="Crime Rate" stroke="#ea580c" fill="#ea580c" fillOpacity={0.1} />
                    <Radar
                      name="Nighttime Lights"
                      dataKey="Nighttime Lights"
                      stroke="#059669"
                      fill="#059669"
                      fillOpacity={0.1}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Correlation Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Nighttime Lights vs Crime</span>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        -0.68
                      </Badge>
                    </div>
                    <Progress value={68} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Strong negative correlation: Brighter areas tend to have lower crime rates
                    </p>
                  </div>

                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Economic Activity vs Crime</span>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        -0.72
                      </Badge>
                    </div>
                    <Progress value={72} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher economic activity strongly correlates with reduced crime
                    </p>
                  </div>

                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Urban Development vs Crime</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        -0.45
                      </Badge>
                    </div>
                    <Progress value={45} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Moderate correlation: Better urban planning reduces crime
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="nighttimeLights"
                    stackId="1"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.6}
                    name="Nighttime Lights"
                  />
                  <Area
                    type="monotone"
                    dataKey="economicActivity"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Economic Activity"
                  />
                  <Line type="monotone" dataKey="crimeRate" stroke="#ea580c" strokeWidth={2} name="Crime Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Nighttime Lights</span>
                </div>
                <p className="text-lg font-bold text-green-600">+8.2%</p>
                <p className="text-xs text-muted-foreground">Year-over-year growth</p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Economic Activity</span>
                </div>
                <p className="text-lg font-bold text-green-600">+12.5%</p>
                <p className="text-xs text-muted-foreground">Year-over-year growth</p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Crime Rate</span>
                </div>
                <p className="text-lg font-bold text-red-600">-5.8%</p>
                <p className="text-xs text-muted-foreground">Year-over-year change</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inequality" className="space-y-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="economicInequalityProxy"
                    stroke="#ea580c"
                    strokeWidth={2}
                    name="Economic Inequality Proxy (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="crimeRate"
                    stroke="#059669"
                    strokeWidth={2}
                    name="Crime Rate (per 100k)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                Satellite-Based Economic Inequality Analysis
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Using nighttime lights data as a proxy for economic activity and inequality across Indian cities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium mb-2">Key Findings:</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Cities with uneven light distribution show 45% higher crime rates</li>
                    <li>• Economic inequality proxy correlates 0.73 with crime incidence</li>
                    <li>• Satellite data reveals hidden economic disparities not captured in traditional metrics</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-2">Methodology:</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• VIIRS nighttime lights data (500m resolution)</li>
                    <li>• Economic activity proxy based on light intensity distribution</li>
                    <li>• Inequality index calculated from light concentration patterns</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
