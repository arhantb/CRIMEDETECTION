"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Filter,
  X,
  CalendarIcon,
  MapPin,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Home,
  Pill,
  HelpCircle,
} from "lucide-react"
import { format } from "date-fns"
import type { CrimeFilters } from "@/lib/types/crime-data"

interface AdvancedFilterPanelProps {
  filters: CrimeFilters
  onFiltersChange: (filters: CrimeFilters) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  activeFilterCount: number
}

const crimeTypeOptions = [
  { id: "theft", label: "Theft", color: "bg-red-500", icon: Shield, aiColor: "#ef4444" },
  { id: "assault", label: "Assault", color: "bg-orange-500", icon: AlertTriangle, aiColor: "#f97316" },
  { id: "fraud", label: "Fraud", color: "bg-yellow-500", icon: Zap, aiColor: "#eab308" },
  { id: "cybercrime", label: "Cybercrime", color: "bg-blue-500", icon: Smartphone, aiColor: "#3b82f6" },
  { id: "domesticViolence", label: "Domestic Violence", color: "bg-purple-500", icon: Home, aiColor: "#a855f7" },
  { id: "drugOffenses", label: "Drug Offenses", color: "bg-green-500", icon: Pill, aiColor: "#22c55e" },
  { id: "other", label: "Other", color: "bg-gray-500", icon: HelpCircle, aiColor: "#6b7280" },
]

const regionOptions = [
  { id: "All India", label: "All India", icon: Globe },
  { id: "North India", label: "North India", icon: MapPin },
  { id: "South India", label: "South India", icon: MapPin },
  { id: "East India", label: "East India", icon: MapPin },
  { id: "West India", label: "West India", icon: MapPin },
  { id: "Central India", label: "Central India", icon: MapPin },
  { id: "Northeast India", label: "Northeast India", icon: MapPin },
]

const stateOptions = [
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "West Bengal",
  "Telangana",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
  "Kerala",
  "Odisha",
  "Assam",
]

const timeRangeOptions = [
  { value: "Last 7 days", label: "Last 7 days" },
  { value: "Last 30 days", label: "Last 30 days" },
  { value: "Last 3 months", label: "Last 3 months" },
  { value: "Last 6 months", label: "Last 6 months" },
  { value: "Last year", label: "Last year" },
  { value: "Custom", label: "Custom Range" },
]

export default function AdvancedFilterPanel({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  activeFilterCount,
}: AdvancedFilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<CrimeFilters>(filters)
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredCrimeType, setHoveredCrimeType] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleCrimeTypeChange = (crimeType: string, checked: boolean) => {
    const updatedTypes = checked
      ? [...localFilters.crimeTypes, crimeType]
      : localFilters.crimeTypes.filter((type) => type !== crimeType)

    setLocalFilters({ ...localFilters, crimeTypes: updatedTypes })
  }

  const handleRegionChange = (region: string, checked: boolean) => {
    let updatedRegions = checked ? [...localFilters.regions, region] : localFilters.regions.filter((r) => r !== region)

    // Handle "All India" selection
    if (region === "All India" && checked) {
      updatedRegions = ["All India"]
    } else if (region !== "All India" && checked) {
      updatedRegions = updatedRegions.filter((r) => r !== "All India")
    }

    setLocalFilters({ ...localFilters, regions: updatedRegions })
  }

  const handleIntensityRangeChange = (range: number[]) => {
    setLocalFilters({ ...localFilters, intensityRange: [range[0], range[1]] })
  }

  const handleTimeRangeChange = (timeRange: string) => {
    setLocalFilters({ ...localFilters, timeRange })
    setShowCustomDateRange(timeRange === "Custom")
  }

  const handleCustomDateRangeChange = () => {
    if (startDate && endDate) {
      setLocalFilters({
        ...localFilters,
        dateRange: {
          start: format(startDate, "yyyy-MM-dd"),
          end: format(endDate, "yyyy-MM-dd"),
        },
      })
    }
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onApplyFilters()
  }

  const resetFilters = () => {
    const defaultFilters: CrimeFilters = {
      crimeTypes: [],
      timeRange: "Last 30 days",
      regions: ["All India"],
      intensityRange: [0, 1],
      dateRange: { start: "", end: "" },
    }
    setLocalFilters(defaultFilters)
    setStartDate(undefined)
    setEndDate(undefined)
    setShowCustomDateRange(false)
    setSearchQuery("")
    onResetFilters()
  }

  const filteredStates = stateOptions.filter((state) => state.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Card className="bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif flex items-center gap-2">
              <div className="relative">
                <Filter className="h-5 w-5 text-primary" />
                <div className="absolute inset-0 h-5 w-5 text-primary/20 animate-ping" />
              </div>
              Advanced Filters
            </CardTitle>
            <CardDescription>Customize your crime data analysis</CardDescription>
          </div>
          {activeFilterCount > 0 && (
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg animate-pulse-glow">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Crime Types Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-primary animate-pulse" />
            <h4 className="text-sm font-medium">Crime Types</h4>
          </div>
          <div className="space-y-3">
            {crimeTypeOptions.map((option) => {
              const IconComponent = option.icon
              const isActive = localFilters.crimeTypes.includes(option.id)
              const isHovered = hoveredCrimeType === option.id

              return (
                <div
                  key={option.id}
                  className={`
                    flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 cursor-pointer
                    ${isActive ? "bg-primary/10 border border-primary/30 shadow-lg" : "hover:bg-muted/50"}
                    ${isHovered ? "scale-105 shadow-xl" : ""}
                  `}
                  onMouseEnter={() => setHoveredCrimeType(option.id)}
                  onMouseLeave={() => setHoveredCrimeType(null)}
                  onClick={() => handleCrimeTypeChange(option.id, !isActive)}
                >
                  <Checkbox
                    id={option.id}
                    checked={isActive}
                    onCheckedChange={(checked) => handleCrimeTypeChange(option.id, checked as boolean)}
                    className={isActive ? "border-primary data-[state=checked]:bg-primary" : ""}
                  />
                  <div className="relative">
                    <IconComponent
                      className={`
                        w-4 h-4 transition-all duration-300
                        ${isActive ? "text-primary scale-110" : "text-muted-foreground"}
                        ${isHovered ? "rotate-12" : ""}
                      `}
                    />
                    {isActive && (
                      <div className="absolute inset-0 animate-ping">
                        <IconComponent className="w-4 h-4 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${isActive ? "shadow-lg animate-pulse-glow" : ""}`}
                    style={{ backgroundColor: option.aiColor }}
                  />
                  <Label
                    htmlFor={option.id}
                    className={`text-sm cursor-pointer transition-colors ${isActive ? "text-primary font-medium" : ""}`}
                  >
                    {option.label}
                  </Label>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Time Range Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <h4 className="text-sm font-medium">Time Range</h4>
          </div>
          <Select value={localFilters.timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary/40 transition-colors">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/20">
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-primary/10">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Range */}
          {showCustomDateRange && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal bg-background/50 border-primary/20 hover:border-primary/40"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card/95 backdrop-blur-xl border-primary/20">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal bg-background/50 border-primary/20 hover:border-primary/40"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card/95 backdrop-blur-xl border-primary/20">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                size="sm"
                onClick={handleCustomDateRangeChange}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Apply Date Range
              </Button>
            </div>
          )}
        </div>

        {/* Regions Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary animate-pulse" />
            <h4 className="text-sm font-medium">Regions</h4>
          </div>
          <div className="space-y-3">
            {regionOptions.map((option) => {
              const IconComponent = option.icon
              const isActive = localFilters.regions.includes(option.id)
              const isHovered = hoveredRegion === option.id

              return (
                <div
                  key={option.id}
                  className={`
                    flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 cursor-pointer
                    ${isActive ? "bg-primary/10 border border-primary/30 shadow-lg" : "hover:bg-muted/50"}
                    ${isHovered ? "scale-105 shadow-xl" : ""}
                  `}
                  onMouseEnter={() => setHoveredRegion(option.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionChange(option.id, !isActive)}
                >
                  <Checkbox
                    id={option.id}
                    checked={isActive}
                    onCheckedChange={(checked) => handleRegionChange(option.id, checked as boolean)}
                    className={isActive ? "border-primary data-[state=checked]:bg-primary" : ""}
                  />
                  <div className="relative">
                    <IconComponent
                      className={`
                        w-4 h-4 transition-all duration-300
                        ${isActive ? "text-primary scale-110" : "text-muted-foreground"}
                        ${isHovered ? "rotate-12" : ""}
                      `}
                    />
                    {isActive && (
                      <div className="absolute inset-0 animate-ping">
                        <IconComponent className="w-4 h-4 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <Label
                    htmlFor={option.id}
                    className={`text-sm cursor-pointer transition-colors ${isActive ? "text-primary font-medium" : ""}`}
                  >
                    {option.label}
                  </Label>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* State Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search states..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-background/50 border-primary/20 hover:border-primary/40 focus:border-primary"
              />
            </div>
            {searchQuery && (
              <div className="mt-2 max-h-32 overflow-y-auto space-y-2">
                {filteredStates.map((state) => {
                  const isActive = localFilters.regions.includes(state)
                  return (
                    <div
                      key={state}
                      className={`
                        flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 cursor-pointer
                        ${isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"}
                      `}
                      onClick={() => handleRegionChange(state, !isActive)}
                    >
                      <Checkbox
                        id={state}
                        checked={isActive}
                        onCheckedChange={(checked) => handleRegionChange(state, checked as boolean)}
                        className={isActive ? "border-primary data-[state=checked]:bg-primary" : ""}
                      />
                      <MapPin className={`w-3 h-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <Label
                        htmlFor={state}
                        className={`text-sm cursor-pointer transition-colors ${isActive ? "text-primary font-medium" : ""}`}
                      >
                        {state}
                      </Label>
                      {isActive && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Crime Intensity Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              Crime Intensity Range
            </h4>
            <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
              {(localFilters.intensityRange[0] * 100).toFixed(0)}% - {(localFilters.intensityRange[1] * 100).toFixed(0)}
              %
            </span>
          </div>
          <div className="relative">
            <Slider
              value={localFilters.intensityRange}
              onValueChange={handleIntensityRangeChange}
              max={1}
              min={0}
              step={0.1}
              className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-primary/25"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-2 bg-gradient-to-r from-green-500/20 via-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Active Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {localFilters.crimeTypes.map((type) => {
                const option = crimeTypeOptions.find((opt) => opt.id === type)
                const IconComponent = option?.icon || HelpCircle
                return (
                  <Badge
                    key={type}
                    className="bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-primary/30 hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 animate-pulse-glow"
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {option?.label}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => handleCrimeTypeChange(type, false)}
                    />
                  </Badge>
                )
              })}
              {localFilters.regions
                .filter((region) => region !== "All India")
                .map((region) => (
                  <Badge
                    key={region}
                    className="bg-gradient-to-r from-secondary/20 to-primary/20 text-secondary border-secondary/30 hover:from-secondary/30 hover:to-primary/30 transition-all duration-300 animate-pulse-glow"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {region}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => handleRegionChange(region, false)}
                    />
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-primary/20">
          <Button
            onClick={applyFilters}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="bg-background/50 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
