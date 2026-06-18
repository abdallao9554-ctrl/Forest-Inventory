import { useState, useEffect } from 'react'
import { useMapEvents, Polygon, Marker } from 'react-leaflet'
import L from 'leaflet'
import { Button } from '@/components/ui/button'
import { Check, X, Undo, Trash2 } from 'lucide-react'

interface DrawingHandlerProps {
    active: boolean
    onDrawFinish?: (geojson: any) => void
}

export function DrawingHandler({ active, onDrawFinish }: DrawingHandlerProps) {
    const [points, setPoints] = useState<L.LatLng[]>([])

    useMapEvents({
        click(e) {
            if (!active) return
            setPoints(prev => [...prev, e.latlng])
        }
    })

    useEffect(() => {
        if (!active) {
            setPoints([])
        }
    }, [active])

    const handleFinish = () => {
        if (points.length < 3) return

        const geojson = {
            type: 'Feature',
            properties: {
                name: `Drawn Area ${new Date().toLocaleTimeString()}`,
                areaHa: calculateArea(points)
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[...points.map(p => [p.lng, p.lat]), [points[0].lng, points[0].lat]]]
            }
        }

        onDrawFinish?.(geojson)
        setPoints([])
    }

    const calculateArea = (pts: L.LatLng[]) => {
        // Very rough approximation for Ha
        const area = (L as any).GeometryUtil?.geodesicArea ? (L as any).GeometryUtil.geodesicArea(pts) : 0
        return (area / 10000).toFixed(2)
    }

    if (!active || points.length === 0) return null

    return (
        <>
            <Polygon positions={points} color="#ef4444" fillOpacity={0.2} />
            {/* Show segments while drawing */}
            {points.map((p, i) => (
                <Marker
                    key={i}
                    position={p}
                    icon={L.divIcon({
                        className: 'bg-red-500 w-3 h-3 rounded-full border-2 border-white',
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    })}
                />
            ))}

            {/* Drawing Controls Overlay */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[2000] flex gap-2 bg-background/95 backdrop-blur-md p-2 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-r flex items-center pr-4">
                    Drawing Polygon
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase"
                    onClick={() => setPoints(p => p.slice(0, -1))}
                    disabled={points.length === 0}
                >
                    <Undo className="h-3 w-3 mr-1" /> Undo
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase"
                    onClick={() => setPoints([])}
                >
                    <Trash2 className="h-3 w-3 mr-1" /> Clear
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase bg-green-600 hover:bg-green-700"
                    onClick={handleFinish}
                    disabled={points.length < 3}
                >
                    <Check className="h-3 w-3 mr-1" /> Finish Area
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPoints([])}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </>
    )
}
