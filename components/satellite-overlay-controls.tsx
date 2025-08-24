"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Satellite, Moon, Zap, Building, Eye, EyeOff, Info } from "lucide-react"
import type { SatelliteOverlaySettings } from "@/lib/types/satellite-data"

interface SatelliteOverlayControlsProps {
  onOverlayChange: (settings: SatelliteOverlaySettings) => void
}

const satelliteIndicators = [
  {
    id: "nighttimeLights",
    label: "Nighttime Lights",
    icon: Moon,
    color: "bg-blue-500",
    description: "VIIRS nighttime lights intensity",
  },
  {
    id: "economicActivity",
    label: "Economic Activity",
    icon: Zap,
    color: "bg-green-500",
    description: "Economic activity proxy from satellite data",
  },
  {
    id: "urbanDevelopment",
    label: "Urban Development",
    icon: Building,
    color: "bg-purple-500",
    description: "Urban development and infrastructure",
  },
  {
    id: "lightPollution",
    label: "Light Pollution",
    icon: Eye,
    color: "bg-orange-500",
    description: "Light pollution levels and distribution",
  },
]

export default function SatelliteOverlayControls({ onOverlayChange }: SatelliteOverlayControlsProps) {
  const [overlaySettings, setOverlaySettings] = useState<SatelliteOverlaySettings>({
    showNighttimeLights: false,
    showEconomicActivity: false,
    showUrbanDevelopment: false,
    showLightPollution: false,
    overlayOpacity: 0.7,
    dataSource: "VIIRS",
    timeRange: "Latest",
  })

  const updateOverlaySettings = (updates: Partial<SatelliteOverlaySettings>) => {
    const newSettings = { ...overlaySettings, ...updates }
    setOverlaySettings(newSettings)
    onOverlayChange(newSettings)
  }

  const getActiveOverlayCount = () => {
    return [
      overlaySettings.showNighttimeLights,
      overlaySettings.showEconomicActivity,
      overlaySettings.showUrbanDevelopment,
      overlaySettings.showLightPollution,
    ].filter(Boolean).length
  }

  const toggleAllOverlays = (enabled: boolean) => {
    updateOverlaySettings({
      showNighttimeLights: enabled,
      showEconomicActivity: enabled,
      showUrbanDevelopment: enabled,
      showLightPollution: enabled,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Satellite Overlays
            </CardTitle>
            <CardDescription>Nighttime lights and economic inequality visualization</CardDescription>
          </div>
          {getActiveOverlayCount() > 0 && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {getActiveOverlayCount()} active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Controls */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Toggle All Satellite Overlays</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllOverlays(true)}
              disabled={getActiveOverlayCount() === 4}
            >
              <Eye className="h-4 w-4 mr-1" />
              Show All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllOverlays(false)}
              disabled={getActiveOverlayCount() === 0}
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Hide All
            </Button>
          </div>
        </div>

        {/* Individual Satellite Overlay Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Satellite Data Layers</h4>
          {satelliteIndicators.map((indicator) => {
            const isActive =
              (indicator.id === "nighttimeLights" && overlaySettings.showNighttimeLights) ||
              (indicator.id === "economicActivity" && overlaySettings.showEconomicActivity) ||
              (indicator.id === "urbanDevelopment" && overlaySettings.showUrbanDevelopment) ||
              (indicator.id === "lightPollution" && overlaySettings.showLightPollution)

            return (
              <div key={indicator.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${indicator.color}`} />
                    <indicator.icon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={indicator.id} className="cursor-pointer font-medium">
                      {indicator.label}
                    </Label>
                  </div>
                  <Switch
                    id={indicator.id}
                    checked={isActive}
                    onCheckedChange={(checked) => {
                      const updates: Partial<SatelliteOverlaySettings> = {}
                      if (indicator.id === "nighttimeLights") updates.showNighttimeLights = checked
                      if (indicator.id === "economicActivity") updates.showEconomicActivity = checked
                      if (indicator.id === "urbanDevelopment") updates.showUrbanDevelopment = checked
                      if (indicator.id === "lightPollution") updates.showLightPollution = checked
                      updateOverlaySettings(updates)
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{indicator.description}</p>
              </div>
            )
          })}
        </div>

        {/* Data Source Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Satellite Data Source</Label>
          <Select
            value={overlaySettings.dataSource}
            onValueChange={(value: "VIIRS" | "DMSP" | "Combined") => updateOverlaySettings({ dataSource: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIIRS">VIIRS (High Resolution)</SelectItem>
              <SelectItem value="DMSP">DMSP (Historical Data)</SelectItem>
              <SelectItem value="Combined">Combined Sources</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {overlaySettings.dataSource === "VIIRS" && "Visible Infrared Imaging Radiometer Suite - 500m resolution"}
            {overlaySettings.dataSource === "DMSP" &&
              "Defense Meteorological Satellite Program - Historical comparison"}
            {overlaySettings.dataSource === "Combined" && "Multi-source composite for enhanced accuracy"}
          </p>
        </div>

        {/* Time Range Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Time Range</Label>
          <Select
            value={overlaySettings.timeRange}
            onValueChange={(value) => updateOverlaySettings({ timeRange: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Latest">Latest Available</SelectItem>
              <SelectItem value="Last Month">Last Month</SelectItem>
              <SelectItem value="Last Quarter">Last Quarter</SelectItem>
              <SelectItem value="Last Year">Last Year</SelectItem>
              <SelectItem value="Historical">Historical Comparison</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overlay Opacity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Overlay Opacity</Label>
            <span className="text-xs text-muted-foreground">{Math.round(overlaySettings.overlayOpacity * 100)}%</span>
          </div>
          <Slider
            value={[overlaySettings.overlayOpacity]}
            onValueChange={([value]) => updateOverlaySettings({ overlayOpacity: value })}
            max={1}
            min={0.1}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Satellite Data Info */}
        <div className="p-3 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Satellite Data Information</h4>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              • <strong>Resolution:</strong> 500m per pixel (VIIRS), 1km per pixel (DMSP)
            </p>
            <p>
              • <strong>Update Frequency:</strong> Daily (VIIRS), Monthly composite available
            </p>
            <p>
              • <strong>Coverage:</strong> Global, with enhanced processing for Indian subcontinent
            </p>
            <p>
              • <strong>Economic Proxy:</strong> Nighttime lights intensity correlates 0.85 with GDP
            </p>
          </div>
        </div>

        {/* Active Overlays Summary */}
        {getActiveOverlayCount() > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Active Satellite Layers</h4>
            <div className="space-y-1">
              {satelliteIndicators
                .filter((indicator) => {
                  return (
                    (indicator.id === "nighttimeLights" && overlaySettings.showNighttimeLights) ||
                    (indicator.id === "economicActivity" && overlaySettings.showEconomicActivity) ||
                    (indicator.id === "urbanDevelopment" && overlaySettings.showUrbanDevelopment) ||
                    (indicator.id === "lightPollution" && overlaySettings.showLightPollution)
                  )
                })
                .map((indicator) => (
                  <div key={indicator.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${indicator.color}`} />
                    <span>{indicator.label}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
