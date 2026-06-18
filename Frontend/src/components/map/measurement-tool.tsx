import { useState, useEffect } from 'react'
import { useMapEvents, Polyline, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'

interface MeasurementToolProps {
    active: boolean
}

export function MeasurementTool({ active }: MeasurementToolProps) {
    const [points, setPoints] = useState<L.LatLng[]>([])
    const [totalDistance, setTotalDistance] = useState(0)

    useMapEvents({
        click(e) {
            if (!active) return
            const newPoints = [...points, e.latlng]
            setPoints(newPoints)
        },
        contextmenu() {
            if (!active) return
            setPoints([])
        }
    })

    useEffect(() => {
        if (!active) {
            setPoints([])
        }
    }, [active])

    useEffect(() => {
        if (points.length < 2) {
            setTotalDistance(0)
            return
        }

        let dist = 0
        for (let i = 0; i < points.length - 1; i++) {
            dist += points[i].distanceTo(points[i + 1])
        }
        setTotalDistance(dist)
    }, [points])

    if (!active || points.length === 0) return null

    return (
        <>
            <Polyline positions={points} color="#f59e0b" weight={4} dashArray="5, 8" />
            {points.map((p, i) => (
                <Marker
                    key={i}
                    position={p}
                    icon={L.divIcon({
                        className: 'bg-amber-500 w-2 h-2 rounded-full border-2 border-white',
                        iconSize: [8, 8],
                        iconAnchor: [4, 4]
                    })}
                />
            ))}
            {points.length > 0 && (
                <Marker
                    position={points[points.length - 1]}
                    icon={L.divIcon({ className: 'hidden' })}
                >
                    <Tooltip sticky permanent direction="top" className="bg-amber-600 text-white border-amber-700 font-bold text-[10px] px-2 py-1 rounded shadow-xl">
                        {(totalDistance / 1000).toFixed(2)} km
                    </Tooltip>
                </Marker>
            )}
        </>
    )
}
