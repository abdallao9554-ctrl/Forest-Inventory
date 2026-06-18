import { useCallback } from 'react'
import { useMapEvents, Polygon, Marker, Popup } from 'react-leaflet'
import { Button } from "@/components/ui/button"
import { Trash2, Undo } from "lucide-react"

interface DrawingMapProps {
    points: [number, number][]
    onChange: (points: [number, number][]) => void
}

function MapEvents({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng)
        },
    })
    return null
}

export function DrawingMapLayer({ points, onChange }: DrawingMapProps) {
    const handleMapClick = useCallback((latlng: L.LatLng) => {
        onChange([...points, [latlng.lat, latlng.lng]])
    }, [points, onChange])

    const removeLastPoint = () => {
        onChange(points.slice(0, -1))
    }

    const clearPoints = () => {
        onChange([])
    }

    return (
        <>
            <MapEvents onMapClick={handleMapClick} />

            {/* Draw Polygon if we have at least 3 points */}
            {points.length >= 3 && (
                <Polygon positions={points} color="blue" />
            )}

            {/* Draw Line if we have 2 points */}
            {points.length === 2 && (
                <Polygon positions={points} color="blue" weight={2} dashArray="5, 10" />
            )}

            {/* Show markers for each point */}
            {points.map((pos, idx) => (
                <Marker key={idx} position={pos}>
                    <Popup>Point {idx + 1}</Popup>
                </Marker>
            ))}

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={removeLastPoint}
                    disabled={points.length === 0}
                >
                    <Undo className="w-4 h-4 mr-2" />
                    Undo Point
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearPoints}
                    disabled={points.length === 0}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                </Button>
            </div>
        </>
    )
}
