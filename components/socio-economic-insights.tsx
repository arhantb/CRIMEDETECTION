"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, GraduationCap, Home, Loader2 } from "lucide-react"
import { crimeDataService } from "@/lib/services/crime-data-service"
import type { CrimeDataPoint } from "@/lib/types/crime-data"

interface CorrelationData {
  indicator: string
  correlation: number
  significance: "high" | "medium" | "low"
  trend: "positive" | "negative"
}

interface EconomicTrendData {
  region: string
  gdpPerCapita: number
  crimeRate: number
  unemploymentRate: number
  literacyRate: number
  povertyIndex: number
}

const mockCorrelationData: CorrelationData[] = [
  { indicator: "GDP Per Capita", correlation: -0.72, significance: "high", trend: "negative" },
  { indicator: "Unemployment Rate", correlation: 0.68, significance: "high", trend: "positive" },
  { indicator: "Poverty Index", correlation: 0.75, significance: "high", trend: "positive" },
  { indicator: "Literacy Rate", correlation: -0.45, significance: "medium", trend: "negative" },
  { indicator: "Population Density", correlation: 0.38, significance: "medium", trend: "positive" },
  { indicator: "Urban Development", correlation: -0.28, significance: "low", trend: "negative" },
]

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"]

export default function SocioEconomicInsights() {
  const [crimeData, setCrimeData] = useState<CrimeDataPoint[]>([])
  const [economicTrends, setEconomicTrends] = useState<EconomicTrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("correlations")

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await crimeDataService.getCrimeData()
        if (response.status === "success") {
          setCrimeData(response.data)

          // Transform crime data into economic trends
          const trends = response.data.map((point) => ({
            region: point.city,
            gdpPerCapita: point.economicIndicators.gdpPerCapita,
            crimeRate: (point.crimes / point.population) * 100000,
            unemploymentRate: point.economicIndicators.unemploymentRate,
            literacyRate: point.economicIndicators.literacyRate,
            povertyIndex: point.economicIndicators.povertyIndex * 100,
          }))
          setEconomicTrends(trends)
        }
      } catch (error) {
        console.error("Failed to load socio-economic data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.7) return "text-red-600"
    if (abs >= 0.5) return "text-orange-600"
    if (abs >= 0.3) return "text-yellow-600"
    return "text-green-600"
  }

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.7) return "Strong"
    if (abs >= 0.5) return "Moderate"
    if (abs >= 0.3) return "Weak"
    return "Very Weak"
  }

  const scatterData = economicTrends.map((trend) => ({
    x: trend.gdpPerCapita / 1000,
    y: trend.crimeRate,
    region: trend.region,
    unemployment: trend.unemploymentRate,
    poverty: trend.povertyIndex,
  }))

  const povertyDistribution = economicTrends
    .map((trend) => ({
      name: trend.region,
      value: trend.povertyIndex,
      crimeRate: trend.crimeRate,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Socio-Economic Insights</CardTitle>
          <CardDescription>Loading economic correlation data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing socio-economic correlations...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Socio-Economic Insights</CardTitle>
        <CardDescription>Crime correlation with economic and social indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="scatter">GDP vs Crime</TabsTrigger>
            <TabsTrigger value="trends">Regional Trends</TabsTrigger>
            <TabsTrigger value="poverty">Poverty Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="correlations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCorrelationData.map((item, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{item.indicator}</h4>
                    <Badge variant={item.significance === "high" ? "default" : "secondary"}>{item.significance}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {item.trend === "positive" ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`font-bold ${getCorrelationColor(item.correlation)}`}>
                      {item.correlation.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">({getCorrelationStrength(item.correlation)})</span>
                  </div>
                  <Progress value={Math.abs(item.correlation) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.trend === "positive"
                      ? `Higher ${item.indicator.toLowerCase()} correlates with more crime`
                      : `Higher ${item.indicator.toLowerCase()} correlates with less crime`}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scatter" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    name="GDP Per Capita"
                    unit="k ₹"
                    label={{ value: "GDP Per Capita (₹ thousands)", position: "insideBottom", offset: -10 }}
                  />
                  <YAxis
                    dataKey="y"
                    name="Crime Rate"
                    unit="/100k"
                    label={{ value: "Crime Rate (per 100k)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      typeof value === "number" ? value.toFixed(1) : value,
                      name === "x" ? "GDP Per Capita (₹k)" : "Crime Rate (/100k)",
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `${payload[0].payload.region}`
                      }
                      return label
                    }}
                  />
                  <Scatter dataKey="y" fill="#059669" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                Scatter plot showing the relationship between GDP per capita and crime rates across major Indian cities.
                Generally, higher GDP correlates with lower crime rates, though some outliers exist.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={economicTrends.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="crimeRate" fill="#059669" name="Crime Rate (/100k)" />
                  <Bar dataKey="unemploymentRate" fill="#10b981" name="Unemployment (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Avg GDP/Capita</p>
                <p className="text-lg font-bold">
                  ₹
                  {(economicTrends.reduce((sum, t) => sum + t.gdpPerCapita, 0) / economicTrends.length / 1000).toFixed(
                    0,
                  )}
                  k
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Avg Unemployment</p>
                <p className="text-lg font-bold">
                  {(economicTrends.reduce((sum, t) => sum + t.unemploymentRate, 0) / economicTrends.length).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Avg Literacy</p>
                <p className="text-lg font-bold">
                  {(economicTrends.reduce((sum, t) => sum + t.literacyRate, 0) / economicTrends.length).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Avg Poverty</p>
                <p className="text-lg font-bold">
                  {(economicTrends.reduce((sum, t) => sum + t.povertyIndex, 0) / economicTrends.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="poverty" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <h4 className="text-sm font-medium mb-4">Poverty Index Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={povertyDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    >
                      {povertyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Poverty Index"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Poverty vs Crime Analysis</h4>
                {povertyDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.value.toFixed(1)}% poverty</p>
                      <p className="text-xs text-muted-foreground">{item.crimeRate.toFixed(1)} crimes/100k</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
