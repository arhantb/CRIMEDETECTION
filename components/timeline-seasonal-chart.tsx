"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Calendar, AlertTriangle } from "lucide-react"
import type { SeasonalPattern } from "@/lib/types/timeline-data"

interface TimelineSeasonalChartProps {
  data: SeasonalPattern[]
}

export default function TimelineSeasonalChart({ data }: TimelineSeasonalChartProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'peak': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'low': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'peak': return 'text-red-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'peak': return 'bg-red-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const maxCrimes = Math.max(...data.map(d => d.averageCrimes))

  return (
    <div className="space-y-6">
      {/* Seasonal Bar Chart */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Monthly Crime Patterns</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Seasonal Analysis
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-2 h-64">
          {data.map((pattern, index) => {
            const height = (pattern.averageCrimes / maxCrimes) * 100
            return (
              <div key={index} className="flex flex-col items-center justify-end">
                <div className="w-full flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                      pattern.trend === 'peak' ? 'bg-red-500' :
                      pattern.trend === 'low' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ height: `${Math.max(height, 8)}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-center">
                    {pattern.monthName.slice(0, 3)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((pattern, index) => (
          <Card key={index} className="cyber-border hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {pattern.monthName}
                </CardTitle>
                <Badge className={getTrendBadge(pattern.trend)}>
                  {pattern.trend.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Crime Count */}
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{pattern.averageCrimes}</p>
                <p className="text-sm text-muted-foreground">Average Crimes</p>
              </div>

              {/* Crime Types Breakdown */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Crime Types</p>
                <div className="space-y-1">
                  {Object.entries(pattern.crimeTypes)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([crimeType, count], crimeIndex) => (
                      <div key={crimeIndex} className="flex items-center justify-between text-sm">
                        <span className="truncate">{crimeType}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {getTrendIcon(pattern.trend)}
                <span className={`text-sm font-medium ${getTrendColor(pattern.trend)}`}>
                  {pattern.trend === 'peak' ? 'Peak Season' : 
                   pattern.trend === 'low' ? 'Low Season' : 'Average Season'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seasonal Summary */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Seasonal Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {data.filter(d => d.trend === 'peak').length}
              </p>
              <p className="text-sm text-muted-foreground">Peak Months</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {data.filter(d => d.trend === 'low').length}
              </p>
              <p className="text-sm text-muted-foreground">Low Months</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {data.filter(d => d.trend === 'average').length}
              </p>
              <p className="text-sm text-muted-foreground">Average Months</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {Math.round(data.reduce((sum, d) => sum + d.averageCrimes, 0) / data.length)}
              </p>
              <p className="text-sm text-muted-foreground">Avg per Month</p>
            </div>
          </div>

          {/* Peak Season Analysis */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3">Peak Season Analysis</h4>
            <div className="space-y-2">
              {data.filter(d => d.trend === 'peak')
                .sort((a, b) => b.averageCrimes - a.averageCrimes)
                .slice(0, 3)
                .map((peak, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                    <span className="font-medium">{peak.monthName}</span>
                    <span className="text-red-600 dark:text-red-400">{peak.averageCrimes} crimes</span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


