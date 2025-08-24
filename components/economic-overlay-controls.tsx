"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layers, DollarSign, Users, GraduationCap, Home, TrendingUp, Eye, EyeOff } from "lucide-react"

interface EconomicOverlayControlsProps {
  onOverlayChange: (overlays: EconomicOverlaySettings) => void
}

interface EconomicOverlaySettings {
  showGDPOverlay: boolean
  showUnemploymentOverlay: boolean
  showLiteracyOverlay: boolean
  showPovertyOverlay: boolean
  overlayOpacity: number
  overlayMode: "heatmap" | "choropleth" | "bubbles"
  selectedIndicator: string
}

const economicIndicators = [
  { id: "gdp", label: "GDP Per Capita", icon: DollarSign, color: "bg-green-500" },
  { id: "unemployment", label: "Unemployment Rate", icon: Users, color: "bg-red-500" },
  { id: "literacy", label: "Literacy Rate", icon: GraduationCap, color: "bg-blue-500" },
  { id: "poverty", label: "Poverty Index", icon: Home, color: "bg-orange-500" },
]

export default function EconomicOverlayControls({ onOverlayChange }: EconomicOverlayControlsProps) {
  const [overlaySettings, setOverlaySettings] = useState<EconomicOverlaySettings>({
    showGDPOverlay: false,
    showUnemploymentOverlay: false,
    showLiteracyOverlay: false,
    showPovertyOverlay: false,
    overlayOpacity: 0.6,
    overlayMode: "heatmap",
    selectedIndicator: "gdp",
  })

  const updateOverlaySettings = (updates: Partial<EconomicOverlaySettings>) => {
    const newSettings = { ...overlaySettings, ...updates }
    setOverlaySettings(newSettings)
    onOverlayChange(newSettings)
  }

  const getActiveOverlayCount = () => {
    return [
      overlaySettings.showGDPOverlay,
      overlaySettings.showUnemploymentOverlay,
      overlaySettings.showLiteracyOverlay,
      overlaySettings.showPovertyOverlay,
    ].filter(Boolean).length
  }

  const toggleAllOverlays = (enabled: boolean) => {
    updateOverlaySettings({
      showGDPOverlay: enabled,
      showUnemploymentOverlay: enabled,
      showLiteracyOverlay: enabled,
      showPovertyOverlay: enabled,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Economic Overlays
            </CardTitle>
            <CardDescription>Visualize socio-economic data on the map</CardDescription>
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
          <Label htmlFor="toggle-all" className="text-sm font-medium">
            Toggle All Overlays
          </Label>
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

        {/* Individual Overlay Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Economic Indicators</h4>
          {economicIndicators.map((indicator) => {
            const isActive =
              (indicator.id === "gdp" && overlaySettings.showGDPOverlay) ||
              (indicator.id === "unemployment" && overlaySettings.showUnemploymentOverlay) ||
              (indicator.id === "literacy" && overlaySettings.showLiteracyOverlay) ||
              (indicator.id === "poverty" && overlaySettings.showPovertyOverlay)

            return (
              <div key={indicator.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${indicator.color}`} />
                  <indicator.icon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={indicator.id} className="cursor-pointer">
                    {indicator.label}
                  </Label>
                </div>
                <Switch
                  id={indicator.id}
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    const updates: Partial<EconomicOverlaySettings> = {}
                    if (indicator.id === "gdp") updates.showGDPOverlay = checked
                    if (indicator.id === "unemployment") updates.showUnemploymentOverlay = checked
                    if (indicator.id === "literacy") updates.showLiteracyOverlay = checked
                    if (indicator.id === "poverty") updates.showPovertyOverlay = checked
                    updateOverlaySettings(updates)
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Overlay Visualization Mode */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Visualization Mode</Label>
          <Select
            value={overlaySettings.overlayMode}
            onValueChange={(value: "heatmap" | "choropleth" | "bubbles") =>
              updateOverlaySettings({ overlayMode: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heatmap">Heat Map</SelectItem>
              <SelectItem value="choropleth">Choropleth</SelectItem>
              <SelectItem value="bubbles">Bubble Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Primary Indicator Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Primary Indicator</Label>
          <Select
            value={overlaySettings.selectedIndicator}
            onValueChange={(value) => updateOverlaySettings({ selectedIndicator: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {economicIndicators.map((indicator) => (
                <SelectItem key={indicator.id} value={indicator.id}>
                  <div className="flex items-center gap-2">
                    <indicator.icon className="h-4 w-4" />
                    {indicator.label}
                  </div>
                </SelectItem>
              ))}
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

        {/* Overlay Legend */}
        {getActiveOverlayCount() > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Active Overlays</h4>
            <div className="space-y-1">
              {economicIndicators
                .filter((indicator) => {
                  return (
                    (indicator.id === "gdp" && overlaySettings.showGDPOverlay) ||
                    (indicator.id === "unemployment" && overlaySettings.showUnemploymentOverlay) ||
                    (indicator.id === "literacy" && overlaySettings.showLiteracyOverlay) ||
                    (indicator.id === "poverty" && overlaySettings.showPovertyOverlay)
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

        {/* Correlation Insights */}
        <div className="p-3 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Key Insight</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Regions with higher GDP per capita typically show 72% lower crime rates, while areas with higher poverty
            indices correlate with 75% more criminal activity.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
