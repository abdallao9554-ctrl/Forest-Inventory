import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

interface HeatmapLayerProps {
    points: Array<{ lat: number; lng: number; intensity: number }>
    max?: number
    radius?: number
    blur?: number
    gradient?: Record<number, string>
    autoFit?: boolean
}

export function HeatmapLayer({
    points,
    max = 1.0,
    radius = 25,
    blur = 15,
    gradient = {
        0.0: 'blue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        1.0: 'red'
    },
    autoFit = true
}: HeatmapLayerProps) {
    const map = useMap()

    useEffect(() => {
        if (!points || points.length === 0) return

        // Convert points to the format expected by leaflet.heat
        // [lat, lng, intensity]
        const heatPoints: [number, number, number][] = points.map(p => [
            p.lat,
            p.lng,
            p.intensity
        ])

        // Create heat layer
        const heat = (L as any).heatLayer(heatPoints, {
            radius,
            blur,
            max,
            gradient
        })

        // Add to map
        heat.addTo(map)

        // Auto-fit map bounds to show all hotspot points
        if (autoFit && points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]))
            map.fitBounds(bounds, {
                padding: [50, 50], // Add padding around the bounds
                maxZoom: 13 // Don't zoom in too much
            })
        }

        // Cleanup on unmount
        return () => {
            map.removeLayer(heat)
        }
    }, [map, points, radius, blur, max, gradient, autoFit])

    return null
}
