"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, AlertTriangle, Sparkles, Target, Zap } from "lucide-react"
import { useEffect, useState } from "react"

interface AIInsight {
  id: string
  type: "trend" | "anomaly" | "prediction" | "correlation"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  data: number[]
  timestamp: string
}

export default function AIInsightPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    // Simulate AI insight generation
    const timer = setTimeout(() => {
      setInsights([
        {
          id: "1",
          type: "trend",
          title: "Assault Crimes Rising in North India",
          description:
            "Assault crimes have increased by 12% across northern states, with Delhi and Punjab showing the highest spikes. Predicted to stabilize next month based on seasonal patterns.",
          confidence: 87,
          impact: "high",
          data: [45, 52, 48, 61, 58, 67, 72],
          timestamp: "2 minutes ago",
        },
        {
          id: "2",
          type: "anomaly",
          title: "Cybercrime Anomaly Detected",
          description:
            "Unusual spike in cybercrime reports in Bangalore tech corridor. 340% increase in phishing attempts detected in the last 48 hours.",
          confidence: 94,
          impact: "high",
          data: [12, 15, 18, 14, 16, 55, 68],
          timestamp: "5 minutes ago",
        },
        {
          id: "3",
          type: "correlation",
          title: "Economic-Crime Correlation",
          description:
            "Strong negative correlation (-0.73) found between GDP per capita and property crimes across metropolitan areas.",
          confidence: 76,
          impact: "medium",
          data: [89, 85, 78, 72, 68, 61, 58],
          timestamp: "8 minutes ago",
        },
        {
          id: "4",
          type: "prediction",
          title: "Theft Prediction Model",
          description:
            "ML model predicts 8% decrease in theft crimes next quarter based on improved street lighting and patrol optimization.",
          confidence: 82,
          impact: "medium",
          data: [34, 32, 29, 27, 25, 23, 21],
          timestamp: "12 minutes ago",
        },
      ])
      setIsGenerating(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "trend":
        return TrendingUp
      case "anomaly":
        return AlertTriangle
      case "prediction":
        return Target
      case "correlation":
        return Zap
    }
  }

  const getInsightColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "trend":
        return "text-blue-400"
      case "anomaly":
        return "text-red-400"
      case "prediction":
        return "text-green-400"
      case "correlation":
        return "text-purple-400"
    }
  }

  const getImpactColor = (impact: AIInsight["impact"]) => {
    switch (impact) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

  return (
    <Card className="bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="relative">
            <Brain className="h-5 w-5 text-primary" />
            {isGenerating && (
              <div className="absolute inset-0 animate-ping">
                <Brain className="h-5 w-5 text-primary/40" />
              </div>
            )}
          </div>
          AI Crime Intelligence
          {isGenerating && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Sparkles className="h-3 w-3 animate-spin" />
              Analyzing...
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted/50 rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted/30 rounded w-full mb-1" />
                <div className="h-3 bg-muted/30 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          insights.map((insight) => {
            const IconComponent = getInsightIcon(insight.type)
            return (
              <div
                key={insight.id}
                className="group p-4 rounded-lg bg-background/30 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${getInsightColor(insight.type)}`} />
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {insight.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>{insight.impact}</Badge>
                    <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{insight.description}</p>

                {/* Mini trend graph */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-6 mr-3">
                    <svg className="w-full h-full" viewBox="0 0 100 20">
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={getInsightColor(insight.type)}
                        points={insight.data
                          .map(
                            (d, i) =>
                              `${(i / (insight.data.length - 1)) * 100},${20 - (d / Math.max(...insight.data)) * 15}`,
                          )
                          .join(" ")}
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{insight.timestamp}</span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
