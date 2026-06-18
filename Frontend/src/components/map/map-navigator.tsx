import { useEffect } from 'react'
import { useMapHelpers } from '@/hooks/use-map-helpers'

interface MapNavigatorProps {
    targetLat?: number
    targetLng?: number
    zoom?: number
}

export function MapNavigator({ targetLat, targetLng, zoom = 15 }: MapNavigatorProps) {
    const { flyToLocation } = useMapHelpers()

    useEffect(() => {
        if (targetLat !== undefined && targetLng !== undefined) {
            flyToLocation(targetLat, targetLng, zoom)
        }
    }, [targetLat, targetLng, zoom, flyToLocation])

    return null
}
