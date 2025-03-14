"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Compass } from "lucide-react"
import L from "leaflet"

export default function MapLocationPicker() {
  const [position, setPosition] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const mapRef = useRef(null)

  

  // Fix Leaflet marker icon issue in Next.js
  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  // Component to handle map clicks and location updates
  function LocationMarker({ position, setPosition }: { position: any; setPosition: any }) {
    const map = useMapEvents({
      click(e: any) {
        setPosition([e.latlng.lat, e.latlng.lng])
      },
    })

    useEffect(() => {
      if (position) {
        map.flyTo(position, map.getZoom())
      }
    }, [position, map])

    return position ? <Marker position={position} /> : null
  }

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setPosition([latitude, longitude] as any)
          setIsLoading(false)
        },
        (error:any) => {
          setError("Unable to retrieve your location")
          setIsLoading(false)
        },
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  // Search for a location using OpenStreetMap Nominatim API
  const searchLocation = async (e:any) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      setError('')
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setPosition([Number.parseFloat(lat), Number.parseFloat(lon)] as any)
      } else {
        setError("Location not found")
      }
    } catch (err) {
      setError("Error searching for location")
    } finally {
      setIsLoading(false)
    }
  }

  // Format coordinates to be more readable
  const formatCoordinate = (coord: any) => {
    return coord ? coord.toFixed(6) : "—"
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="h-[500px] rounded-lg overflow-hidden border">
        <MapContainer
          center={position || [51.505, -0.09] }
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Latitude:</span>
                <span className="font-mono">{position ? formatCoordinate(position[0]) : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Longitude:</span>
                <span className="font-mono">{position ? formatCoordinate(position[1]) : "—"}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={getCurrentLocation} disabled={isLoading}>
              <Compass className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Get Current Location"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Location</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={searchLocation} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter location name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" disabled={isLoading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">
          <p>Click anywhere on the map to select a location and view its coordinates.</p>
        </div>
      </div>
    </div>
  )
}

