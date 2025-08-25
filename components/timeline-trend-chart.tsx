"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { CrimeTrend } from "@/lib/types/timeline-data"

interface TimelineTrendChartProps {
  data: CrimeTrend[]
}

export default function TimelineTrendChart({ data }: TimelineTrendChartProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-500'
      case 'decreasing': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getMaxValue = (trend: CrimeTrend) => {
    return Math.max(...trend.monthlyData.map(d => d.count))
  }

  return (
    <div className="space-y-6">
      {data.map((trend, index) => (
        <Card key={index} className="cyber-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getTrendIcon(trend.trend)}
                {trend.crimeGroup}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={trend.trend === 'increasing' ? 'destructive' : 'default'}>
                  {trend.trend}
                </Badge>
                <span className={`text-sm font-medium ${getTrendColor(trend.trend)}`}>
                  {trend.percentageChange > 0 ? '+' : ''}{trend.percentageChange}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple Bar Chart */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Monthly Trend</span>
                  <span>Max: {getMaxValue(trend)}</span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {trend.monthlyData.slice(-12).map((month, monthIndex) => {
                    const height = (month.count / getMaxValue(trend)) * 100
                    return (
                      <div key={monthIndex} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-300 hover:from-primary/80 hover:to-primary/40"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-left">
                          {month.month.split('-')[1]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Trend Summary */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total Incidents</p>
                  <p className="text-lg font-semibold">
                    {trend.monthlyData.reduce((sum, month) => sum + month.count, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average per Month</p>
                  <p className="text-lg font-semibold">
                    {Math.round(trend.monthlyData.reduce((sum, month) => sum + month.count, 0) / trend.monthlyData.length)}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Recent Activity</p>
                <div className="space-y-2">
                  {trend.monthlyData.slice(-3).reverse().map((month, monthIndex) => (
                    <div key={monthIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm">{month.month}</span>
                      <span className="font-medium">{month.count} incidents</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
