
import { useMap } from 'react-leaflet'

export function useMapHelpers() {
    const map = useMap()

    const flyToLocation = (lat: number, lng: number, zoom: number = 15) => {
        map.flyTo([lat, lng], zoom, {
            duration: 1.5
        })
    }

    return {
        flyToLocation,
        map
    }
}
