import { GeoJSON, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import type { Compartment } from '@/api/inventory'

interface CompartmentLayerProps {
    compartments: Compartment[]
    onSelect?: (compartment: Compartment) => void
}

export function CompartmentLayer({ compartments, onSelect }: CompartmentLayerProps) {
    const onEachFeature = (feature: any, layer: L.Layer) => {
        const compartment = feature.properties as Compartment

        layer.on({
            click: (e) => {
                L.DomEvent.stopPropagation(e)
                if (onSelect) onSelect(compartment)
            },
            mouseover: (e) => {
                const layer = e.target
                layer.setStyle({
                    fillOpacity: 0.7,
                    weight: 3,
                    color: '#22c55e'
                })
            },
            mouseout: (e) => {
                const layer = e.target
                layer.setStyle({
                    fillOpacity: 0.2,
                    weight: 2,
                    color: '#16a34a'
                })
            }
        })
    }


    return (
        <>
            {compartments.map(c => (
                <GeoJSON
                    key={c.id}
                    data={{
                        type: 'Feature',
                        properties: c,
                        geometry: c.geoJson
                    } as any}
                    style={{
                        color: '#16a34a',
                        weight: 2,
                        opacity: 1,
                        fillColor: '#22c55e',
                        fillOpacity: 0.2,
                    }}
                    onEachFeature={onEachFeature}
                >
                    <Tooltip sticky>
                        <div className="p-1">
                            <span className="font-bold">{c.name}</span>
                            <div className="text-[10px] text-muted-foreground">{c.forestName}</div>
                        </div>
                    </Tooltip>
                </GeoJSON>
            ))}
        </>
    )
}
