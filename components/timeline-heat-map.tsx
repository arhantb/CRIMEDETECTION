"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, MapPin, AlertTriangle } from "lucide-react"
import type { DistrictHotspot } from "@/lib/types/timeline-data"

interface TimelineHeatMapProps {
  data: DistrictHotspot[]
}

export default function TimelineHeatMap({ data }: TimelineHeatMapProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getIntensityColor = (crimeRate: number) => {
    if (crimeRate > 15) return 'bg-red-500'
    if (crimeRate > 10) return 'bg-orange-500'
    if (crimeRate > 5) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getIntensityText = (crimeRate: number) => {
    if (crimeRate > 15) return 'Critical'
    if (crimeRate > 10) return 'High'
    if (crimeRate > 5) return 'Medium'
    return 'Low'
  }

  const maxCrimeCount = Math.max(...data.map(d => d.crimeCount))

  return (
    <div className="space-y-6">
      {/* Heat Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((hotspot, index) => (
          <Card key={index} className="cyber-border hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {hotspot.district}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {getTrendIcon(hotspot.trend)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Crime Count Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Crime Count</span>
                  <span className="font-medium">{hotspot.crimeCount}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500`}
                    style={{ width: `${(hotspot.crimeCount / maxCrimeCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Crime Rate */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Crime Rate</span>
                <Badge className={getIntensityColor(hotspot.crimeRate)}>
                  {getIntensityText(hotspot.crimeRate)}
                </Badge>
              </div>

              {/* Top Crime Types */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Top Crime Types</p>
                <div className="flex flex-wrap gap-1">
                  {hotspot.topCrimeTypes.map((crimeType, crimeIndex) => (
                    <Badge key={crimeIndex} variant="outline" className="text-xs">
                      {crimeType}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Coordinates */}
              <div className="text-xs text-muted-foreground">
                <p>Lat: {hotspot.coordinates.lat.toFixed(4)}</p>
                <p>Lng: {hotspot.coordinates.lng.toFixed(4)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Hotspot Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{data.length}</p>
              <p className="text-sm text-muted-foreground">Total Hotspots</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {data.filter(d => d.crimeRate > 10).length}
              </p>
              <p className="text-sm text-muted-foreground">High Risk Areas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {data.filter(d => d.trend === 'increasing').length}
              </p>
              <p className="text-sm text-muted-foreground">Increasing Trends</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {Math.round(data.reduce((sum, d) => sum + d.crimeRate, 0) / data.length)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Crime Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level Distribution */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { level: 'Critical', color: 'bg-red-500', count: data.filter(d => d.crimeRate > 15).length },
              { level: 'High', color: 'bg-orange-500', count: data.filter(d => d.crimeRate > 10 && d.crimeRate <= 15).length },
              { level: 'Medium', color: 'bg-yellow-500', count: data.filter(d => d.crimeRate > 5 && d.crimeRate <= 10).length },
              { level: 'Low', color: 'bg-green-500', count: data.filter(d => d.crimeRate <= 5).length }
            ].map((risk, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${risk.color}`} />
                <span className="flex-1 text-sm">{risk.level} Risk</span>
                <span className="font-medium">{risk.count} districts</span>
                <div className="w-20 bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${risk.color}`}
                    style={{ width: `${(risk.count / data.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
