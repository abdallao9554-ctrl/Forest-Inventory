import { MapContainer, TileLayer, LayersControl, ScaleControl, ZoomControl, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'
import type { LatLngExpression } from 'leaflet'
import { useState } from 'react'

interface MapViewProps {
    center?: LatLngExpression
    zoom?: number
    className?: string
    children?: React.ReactNode
}

function MouseCoordinates() {
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)

    useMapEvents({
        mousemove(e) {
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
        }
    })

    if (!coords) return null

    return (
        <div className="absolute bottom-2 right-2 z-[1000] bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono border shadow-sm">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
    )
}

// Default center
const DEFAULT_CENTER: LatLngExpression = [-1.2921, 36.8219]
const DEFAULT_ZOOM = 13

export function MapView({
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    className,
    children
}: MapViewProps) {
    return (
        <div className={cn("relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border", className)}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <ScaleControl position="bottomleft" />

                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite">
                        <TileLayer
                            attribution='Tiles &copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                    {children}
                </LayersControl>
                <MouseCoordinates />
            </MapContainer>
        </div>
    )
}
