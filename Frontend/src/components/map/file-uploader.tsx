import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import Papa from 'papaparse'
// @ts-ignore
import shp from 'shpjs'
import { v4 as uuidv4 } from 'uuid'

interface FileUploaderProps {
    onLayersUploaded: (layers: any[]) => void
}

export function FileUploader({ onLayersUploaded }: FileUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const newLayers: any[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const name = file.name
            const extension = name.split('.').pop()?.toLowerCase()

            try {
                if (extension === 'csv') {
                    const text = await file.text()
                    const result = Papa.parse(text, { header: true, skipEmptyLines: true })

                    // Convert CSV to GeoJSON Points if it has lat/lng
                    const features = result.data
                        .filter((row: any) => (row.lat || row.latitude) && (row.lng || row.longitude))
                        .map((row: any) => ({
                            type: 'Feature',
                            properties: row,
                            geometry: {
                                type: 'Point',
                                coordinates: [
                                    parseFloat(row.lng || row.longitude),
                                    parseFloat(row.lat || row.latitude)
                                ]
                            }
                        }))

                    if (features.length > 0) {
                        newLayers.push({
                            id: uuidv4(),
                            name,
                            type: 'CSV',
                            data: { type: 'FeatureCollection', features }
                        })
                    }
                } else if (extension === 'zip') {
                    // Assume it's a shapefile zip
                    const arrayBuffer = await file.arrayBuffer()
                    const geojson = await shp(arrayBuffer)
                    newLayers.push({
                        id: uuidv4(),
                        name,
                        type: 'Shapefile',
                        data: geojson
                    })
                } else if (extension === 'kml' || extension === 'geojson' || extension === 'json') {
                    const text = await file.text()
                    const geojson = JSON.parse(text)
                    newLayers.push({
                        id: uuidv4(),
                        name,
                        type: extension.toUpperCase(),
                        data: geojson
                    })
                }
            } catch (err) {
                console.error(`Error parsing ${name}:`, err)
            }
        }

        onLayersUploaded(newLayers)
        setIsUploading(false)
        // Reset input
        e.target.value = ''
    }

    return (
        <div className="space-y-4">
            <div className="relative group">
                <input
                    type="file"
                    multiple
                    accept=".csv,.zip,.kml,.geojson,.json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                />
                <div className={cn(
                    "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all bg-muted/20",
                    isUploading ? "opacity-50" : "group-hover:border-primary/50 group-hover:bg-primary/5"
                )}>
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                    )}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Click or Drag to Upload</p>
                    <p className="text-[9px] text-muted-foreground mt-1 text-center px-4">
                        Supports CSV, KML, GeoJSON, and Shapefile (zip)
                    </p>
                </div>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
