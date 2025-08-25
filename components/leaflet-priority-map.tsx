"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  AlertTriangle, 
  Target, 
  ZoomIn, 
  ZoomOut, 
  Layers,
  Info,
  Shield
} from 'lucide-react'
import type { DistrictHotspot } from '@/lib/types/timeline-data'

interface LeafletPriorityMapProps {
  data: DistrictHotspot[]
  className?: string
}

declare global {
  interface Window {
    L: any
  }
}

export default function LeafletPriorityMap({ data, className }: LeafletPriorityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string>("")
  const [selectedHotspot, setSelectedHotspot] = useState<DistrictHotspot | null>(null)
  const [zoomLevel, setZoomLevel] = useState(10)

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
        }

        // Load JS
        if (!window.L) {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
          script.crossOrigin = ''
          script.onload = () => {
            setIsMapLoaded(true)
          }
          script.onerror = () => {
            setMapError("Failed to load map library")
          }
          document.head.appendChild(script)
        } else {
          setIsMapLoaded(true)
        }
      } catch (error) {
        setMapError("Failed to initialize map")
      }
    }

    loadLeaflet()
  }, [])

     // Initialize map
   useEffect(() => {
     if (!isMapLoaded || !mapRef.current || !data.length) return

           console.log('Map data received:', data)
      console.log('First hotspot:', data[0])
      console.log('Total hotspots:', data.length)
      console.log('Valid hotspots with coordinates:', data.filter(h => h.coordinates && h.coordinates.lat && h.coordinates.lng).length)

    try {
      const L = window.L

             // Calculate center from data
       const validData = data.filter(hotspot => 
         hotspot.coordinates && hotspot.coordinates.lat && hotspot.coordinates.lng && 
         !isNaN(hotspot.coordinates.lat) && !isNaN(hotspot.coordinates.lng)
       )

       if (validData.length === 0) {
         setMapError("No valid location data found")
         return
       }

       const centerLat = validData.reduce((sum, d) => sum + d.coordinates.lat, 0) / validData.length
       const centerLng = validData.reduce((sum, d) => sum + d.coordinates.lng, 0) / validData.length

      // Initialize map
      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Add zoom controls
      L.control.zoom({
        position: 'topright'
      }).addTo(map)

      // Create markers for each hotspot
      const markers: any[] = []
      const markerGroups: { [key: string]: any[] } = {
        high: [],
        medium: [],
        low: []
      }

      validData.forEach((hotspot, index) => {
        // Determine priority based on crime count and trend
        const crimeCount = hotspot.crimeCount
        const trend = hotspot.trend
        
        let priority = 'low'
        let color = '#10b981' // green
        let iconSize = [25, 25]
        
                 if (crimeCount > 20 || trend > 30) {
           priority = 'high'
           color = '#ef4444' // red
           iconSize = [35, 35]
         } else if (crimeCount > 10 || trend > 15) {
           priority = 'medium'
           color = '#f59e0b' // amber
           iconSize = [30, 30]
         }

        // Create custom icon
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: ${iconSize[0]}px;
              height: ${iconSize[1]}px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: iconSize,
          iconAnchor: [iconSize[0] / 2, iconSize[1] / 2]
        })

                 const marker = L.marker([hotspot.coordinates.lat, hotspot.coordinates.lng], { icon })
          .addTo(map)
                     .bindPopup(`
             <div style="min-width: 200px;">
               <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">
                 ${hotspot.district}
               </h3>
              <div style="margin-bottom: 8px;">
                <span style="color: #6b7280; font-size: 12px;">Crime Count:</span>
                <span style="color: #1f2937; font-weight: 500; margin-left: 4px;">
                  ${hotspot.crimeCount.toLocaleString()}
                </span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="color: #6b7280; font-size: 12px;">Crime Rate:</span>
                <span style="color: #1f2937; font-weight: 500; margin-left: 4px;">
                  ${hotspot.crimeRate.toFixed(2)} per 1000
                </span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="color: #6b7280; font-size: 12px;">Trend:</span>
                <span style="color: ${trend > 0 ? '#ef4444' : '#10b981'}; font-weight: 500; margin-left: 4px;">
                  ${trend > 0 ? '+' : ''}${trend.toFixed(1)}%
                </span>
              </div>
              <div>
                <span style="
                  background: ${color};
                  color: white;
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 500;
                  text-transform: uppercase;
                ">
                  ${priority} Priority
                </span>
              </div>
            </div>
          `)

        marker.on('click', () => {
          setSelectedHotspot(hotspot)
        })

        markers.push(marker)
        markerGroups[priority].push(marker)
      })

      // Add layer control
      const overlayMaps = {
        'High Priority': L.layerGroup(markerGroups.high),
        'Medium Priority': L.layerGroup(markerGroups.medium),
        'Low Priority': L.layerGroup(markerGroups.low)
      }

      L.control.layers(null, overlayMaps, {
        position: 'topright',
        collapsed: false
      }).addTo(map)

      // Store map instance
      mapInstanceRef.current = map

      // Update zoom level
      map.on('zoomend', () => {
        setZoomLevel(map.getZoom())
      })

      // Cleanup
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }
      }
    } catch (error) {
      setMapError("Failed to render map")
    }
  }, [isMapLoaded, data])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

         const handleResetView = () => {
         if (mapInstanceRef.current && data.length > 0) {
           const validData = data.filter(hotspot => 
             hotspot.coordinates && hotspot.coordinates.lat && hotspot.coordinates.lng && 
             !isNaN(hotspot.coordinates.lat) && !isNaN(hotspot.coordinates.lng)
           )
           if (validData.length > 0) {
             const centerLat = validData.reduce((sum, d) => sum + d.coordinates.lat, 0) / validData.length
             const centerLng = validData.reduce((sum, d) => sum + d.coordinates.lng, 0) / validData.length
             mapInstanceRef.current.setView([centerLat, centerLng], 10)
           }
         }
       }

  if (mapError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            High Priority Areas Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          High Priority Areas Map
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Interactive map showing crime hotspots by priority level
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                High Priority
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                Medium Priority
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Low Priority
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={!isMapLoaded}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={!isMapLoaded}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetView}
                disabled={!isMapLoaded}
              >
                <Layers className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Map Container */}
          <div 
            ref={mapRef}
            className="w-full h-[400px] rounded-lg border border-border bg-muted/20"
            style={{ minHeight: '400px' }}
          >
            {!isMapLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Hotspot Info */}
          {selectedHotspot && (
            <div className="p-4 bg-muted/50 rounded-lg border">
                             <h4 className="font-semibold mb-2 flex items-center gap-2">
                 <Info className="h-4 w-4" />
                 {selectedHotspot.district}
               </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Crime Count:</span>
                  <span className="ml-2 font-medium">{selectedHotspot.crimeCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Crime Rate:</span>
                  <span className="ml-2 font-medium">{selectedHotspot.crimeRate.toFixed(2)} per 1000</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Trend:</span>
                  <span className={`ml-2 font-medium ${selectedHotspot.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedHotspot.trend > 0 ? '+' : ''}{selectedHotspot.trend.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                                     <Badge 
                     variant={selectedHotspot.crimeCount > 20 ? "destructive" : selectedHotspot.crimeCount > 10 ? "default" : "secondary"}
                     className="ml-2"
                   >
                     {selectedHotspot.crimeCount > 20 ? 'High' : selectedHotspot.crimeCount > 10 ? 'Medium' : 'Low'}
                   </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Map Info */}
          <div className="text-xs text-muted-foreground text-center">
            Zoom: {zoomLevel} | Click markers for details | Use layer controls to filter by priority
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
