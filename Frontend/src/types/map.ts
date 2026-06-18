export interface HotspotPoint {
    lat: number
    lng: number
    intensity: number
}

export interface HotspotData {
    permits: HotspotPoint[]
    inventory: HotspotPoint[]
    combined: HotspotPoint[]
}

export type HotspotCategory = 'permits' | 'inventory' | 'combined'
