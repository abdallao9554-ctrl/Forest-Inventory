import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface NDVIOverlayProps {
    imageUrl: string;
    bounds: L.LatLngBoundsExpression;
    pixelData: number[][];
    opacity?: number;
    onIdentify?: (latlng: L.LatLng, value: number) => void;
}

export function NDVIOverlay({
    imageUrl,
    bounds,
    pixelData,
    opacity = 0.7,
    onIdentify
}: NDVIOverlayProps) {
    const map = useMap();
    const layerRef = useRef<L.ImageOverlay | null>(null);

    useEffect(() => {
        if (!imageUrl || !bounds || !pixelData) return;

        // Create the image overlay
        const layer = L.imageOverlay(imageUrl, bounds, {
            opacity,
            interactive: true, // We want click events
            crossOrigin: true
        });

        layer.addTo(map);
        layerRef.current = layer;

        // Leaflet click handler (identify)
        const handleClick = (e: L.LeafletMouseEvent) => {
            const latlng = e.latlng;
            
            // Convert LatLng to Pixel relative to the overlay bounds
            // Using a more robust conversion than just container point
            const b = L.latLngBounds(bounds as any);
            const height = pixelData.length;
            const width = pixelData[0].length;
            
            const latRange = b.getNorth() - b.getSouth();
            const lngRange = b.getEast() - b.getWest();

            // Calculate percentage from top-left (images originate from top-left)
            const yPct = (b.getNorth() - latlng.lat) / latRange;
            const xPct = (latlng.lng - b.getWest()) / lngRange;

            // Map percentage to pixel array indices
            const pxY = Math.floor(yPct * height);
            const pxX = Math.floor(xPct * width);

            const value = pixelData[pxY]?.[pxX];

            if (value !== undefined) {
                // If provided, call custom identify callback
                if (onIdentify) {
                    onIdentify(latlng, value);
                } else {
                    // Default behavior: Standard Leaflet popup
                    L.popup()
                        .setLatLng(latlng)
                        .setContent(`
                            <div class="p-1">
                                <p class="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1 mb-1">Pixel Forensics</p>
                                <p class="text-sm"><b>NDVI:</b> <span class="text-primary font-black">${value.toFixed(3)}</span></p>
                                <p class="text-[10px] text-muted-foreground">Lat: ${latlng.lat.toFixed(5)}</p>
                                <p class="text-[10px] text-muted-foreground">Lng: ${latlng.lng.toFixed(5)}</p>
                            </div>
                        `)
                        .openOn(map);
                }
            }
        };

        map.on('click', handleClick);

        // Cleanup
        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
            map.off('click', handleClick);
        };
    }, [map, imageUrl, bounds, pixelData, opacity, onIdentify]);

    return null;
}
