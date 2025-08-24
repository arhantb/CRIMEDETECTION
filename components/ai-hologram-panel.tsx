"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"

interface SparklineData {
  value: number
  timestamp: string
}

interface AIHologramPanelProps {
  title: string
  value: string | number
  trend: number
  trendLabel: string
  icon: LucideIcon
  color: string
  sparklineData: SparklineData[]
  prediction?: {
    nextValue: string | number
    confidence: number
    direction: "up" | "down" | "stable"
  }
  loading?: boolean
}

export default function AIHologramPanel({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  color,
  sparklineData,
  prediction,
  loading = false,
}: AIHologramPanelProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    if (typeof value === "number") {
      const timer = setTimeout(() => {
        setAnimatedValue(value)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [value])

  const maxSparkline = Math.max(...sparklineData.map((d) => d.value))
  const minSparkline = Math.min(...sparklineData.map((d) => d.value))

  const normalizeSparkline = (val: number) => {
    return ((val - minSparkline) / (maxSparkline - minSparkline)) * 100
  }

  const getPredictionIcon = () => {
    if (!prediction) return null
    switch (prediction.direction) {
      case "up":
        return "↗"
      case "down":
        return "↘"
      case "stable":
        return "→"
    }
  }

  return (
    <Card
      className={`
        relative overflow-hidden transition-all duration-500 ease-out
        bg-gradient-to-br from-card/80 via-card/60 to-card/40
        backdrop-blur-xl border-0
        hover:scale-105 hover:shadow-2xl
        ${isHovered ? "shadow-[0_0_30px_rgba(6,182,212,0.3)]" : "shadow-lg"}
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
        after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Holographic border effect */}
      <div
        className={`absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 p-[1px] ${isHovered ? "animate-pulse" : ""}`}
      >
        <div className="h-full w-full rounded-lg bg-card/90 backdrop-blur-xl" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-primary/40 rounded-full animate-float-${i % 3}`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={`text-sm font-medium transition-all duration-300 ${isHovered ? "text-foreground" : "text-muted-foreground"}`}
        >
          {title}
        </CardTitle>
        <div className="relative">
          <Icon
            className={`h-5 w-5 transition-all duration-300 ${isHovered ? "scale-110 rotate-12" : ""}`}
            style={{ color }}
          />
          {isHovered && (
            <div className="absolute inset-0 animate-ping">
              <Icon className="h-5 w-5 opacity-20" style={{ color }} />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Main Value with AI Animation */}
        <div className="flex items-baseline gap-2 mb-2">
          <div
            className={`text-3xl font-bold transition-all duration-500 ${isHovered ? "scale-110" : ""}`}
            style={{ color }}
          >
            {loading ? (
              <div className="animate-pulse bg-gradient-to-r from-primary/20 to-secondary/20 h-8 w-20 rounded" />
            ) : (
              <span className="bg-gradient-to-r from-current to-current/70 bg-clip-text">
                {typeof value === "number" ? animatedValue.toLocaleString() : value}
              </span>
            )}
          </div>
          {prediction && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-primary">{getPredictionIcon()}</span>
              <span>{prediction.nextValue}</span>
            </div>
          )}
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            <span className={`font-semibold ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
              {trend >= 0 ? "+" : ""}
              {trend}%
            </span>{" "}
            {trendLabel}
          </p>
          {prediction && <div className="text-xs text-primary/70">{prediction.confidence}% confidence</div>}
        </div>

        {/* Sparkline Graph */}
        <div className="relative h-8 mb-2">
          <svg className="w-full h-full" viewBox="0 0 100 30">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke={`url(#gradient-${title})`}
              strokeWidth="2"
              points={sparklineData
                .map(
                  (d, i) =>
                    `${(i / (sparklineData.length - 1)) * 100},${30 - (normalizeSparkline(d.value) / 100) * 25}`,
                )
                .join(" ")}
              className={`transition-all duration-500 ${isHovered ? "stroke-[3]" : ""}`}
            />
            {/* Glow effect on hover */}
            {isHovered && (
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="6"
                opacity="0.3"
                points={sparklineData
                  .map(
                    (d, i) =>
                      `${(i / (sparklineData.length - 1)) * 100},${30 - (normalizeSparkline(d.value) / 100) * 25}`,
                  )
                  .join(" ")}
                className="animate-pulse"
              />
            )}
          </svg>
        </div>

        {/* Radial Progress Ring */}
        <div className="flex justify-center">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/20"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - (typeof value === "number" ? Math.min(value / 100000, 1) : 0.7))}`}
                className={`transition-all duration-1000 ${isHovered ? "drop-shadow-[0_0_6px_currentColor]" : ""}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color }}>
                {typeof value === "number" ? Math.round((value / 100000) * 100) : 70}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
