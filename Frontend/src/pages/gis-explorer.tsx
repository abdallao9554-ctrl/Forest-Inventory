import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Search,
    Maximize2,
    Map as MapIcon,
    Compass,
    Ruler,
    Trash2
} from 'lucide-react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'

import { MapView } from '@/components/map/map-view'
import { CompartmentLayer } from '@/components/map/compartment-layer'
import { PermitMarker } from '@/components/map/permit-marker'
import { HeatmapLayer } from '@/components/map/heatmap-layer'
import { MapToolbar } from '@/components/map/map-toolbar'
import { MeasurementTool } from '@/components/map/measurement-tool'
import { DrawingHandler } from '@/components/map/drawing-handler'
import { FileUploader } from '@/components/map/file-uploader'
import { inventoryApi } from '@/api/inventory'
import { dashboardApi } from '@/api/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export default function GisExplorerPage() {
    const [activeLayers, setActiveLayers] = useState({
        compartments: true,
        permits: true,
        heatmap: false,
    })
    const [uploadedLayers, setUploadedLayers] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<{ type: string, data: any } | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTool, setActiveTool] = useState('select')

    const { data: compartments = [] } = useQuery({
        queryKey: ['inventory', 'compartments'],
        queryFn: inventoryApi.getCompartments
    })

    const { data: permitLocations = [] } = useQuery({
        queryKey: ['dashboard', 'permit-locations'],
        queryFn: dashboardApi.getPermitLocations
    })

    const { data: hotspotData } = useQuery({
        queryKey: ['dashboard', 'hotspots'],
        queryFn: dashboardApi.getHotspotData
    })

    const toggleLayer = (layer: keyof typeof activeLayers) => {
        setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
    }

    const handleFileUpload = (newLayers: any[]) => {
        setUploadedLayers(prev => [...prev, ...newLayers])
    }

    const handleDrawFinish = (feature: any) => {
        const newLayer = {
            id: Math.random().toString(36).substr(2, 9),
            name: feature.properties.name,
            type: 'DRAWN',
            data: feature
        }
        setUploadedLayers(prev => [...prev, newLayer])
        setActiveTool('select')
    }

    const removeUploadedLayer = (id: string) => {
        setUploadedLayers(prev => prev.filter(l => l.id !== id))
    }

    const filteredCompartments = compartments.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.forestName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-8">
            {/* Sidebar Controls */}
            <div className="w-80 border-r bg-card flex flex-col z-10 shadow-xl">
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Compass className="h-5 w-5 text-primary" />
                        <h2 className="font-bold text-lg">WebGIS Explorer</h2>
                    </div>
                </div>

                <Tabs defaultValue="layers" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-4">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="layers" className="text-xs font-bold uppercase">Layers & Data</TabsTrigger>
                            <TabsTrigger value="tools" className="text-xs font-bold uppercase">Tools & Upload</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="layers" className="flex-1 overflow-y-auto p-4 space-y-6 m-0">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter Registry..."
                                className="pl-8 bg-background h-8 text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Map Layers */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-l-2 border-primary pl-2">
                                System Layers
                            </h3>
                            <div className="space-y-1">
                                {[
                                    { id: 'compartments', label: 'Inventory Compartments', color: 'bg-green-500' },
                                    { id: 'permits', label: 'Active Permits', color: 'bg-blue-500' },
                                    { id: 'heatmap', label: 'Harvesting Hotspots', color: 'bg-orange-500' }
                                ].map(layer => (
                                    <button
                                        key={layer.id}
                                        onClick={() => toggleLayer(layer.id as any)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group",
                                            activeLayers[layer.id as keyof typeof activeLayers]
                                                ? "bg-primary/5 border border-primary/20 text-primary font-bold shadow-sm"
                                                : "hover:bg-muted text-muted-foreground border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-2 w-2 rounded-full", layer.color)} />
                                            <span className="text-xs">{layer.label}</span>
                                        </div>
                                        <div className={cn(
                                            "h-3 w-6 rounded-full relative transition-colors bg-muted border",
                                            activeLayers[layer.id as keyof typeof activeLayers] && "bg-primary border-primary"
                                        )}>
                                            <div className={cn(
                                                "absolute top-0.5 left-0.5 h-1.5 w-1.5 rounded-full bg-white transition-transform",
                                                activeLayers[layer.id as keyof typeof activeLayers] && "translate-x-2.5"
                                            )} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Uploaded Layers List */}
                        {uploadedLayers.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-l-2 border-amber-500 pl-2">
                                    Imported Data
                                </h3>
                                <div className="space-y-1">
                                    {uploadedLayers.map(layer => (
                                        <div key={layer.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[11px]">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                <span className="font-bold truncate max-w-[150px]">{layer.name}</span>
                                                <Badge className="text-[8px] h-4 bg-amber-500/10 text-amber-600 border-amber-500/20">{layer.type}</Badge>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeUploadedLayer(layer.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Results / Details */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-l-2 border-primary pl-2">
                                Selection Details
                            </h3>
                            {selectedItem ? (
                                <Card className="border-primary/20 bg-primary/5 overflow-hidden shadow-lg animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="h-1 bg-primary w-full" />
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge className="text-[9px] h-5 bg-primary/10 text-primary border-primary/20">{selectedItem.type}</Badge>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedItem(null)}>
                                                <Maximize2 className="h-3 w-3 rotate-45" />
                                            </Button>
                                        </div>
                                        <CardTitle className="text-lg font-black mt-2">
                                            {selectedItem.data.name || selectedItem.data.permitNumber || 'Selected Feature'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2 text-xs space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold font-mono">ID/Value</span>
                                                <div className="font-mono text-[10px] font-bold truncate">{selectedItem.data.id || 'N/A'}</div>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Metadata</span>
                                                <div className="truncate font-bold">Details Attached</div>
                                            </div>
                                        </div>
                                        <Button className="w-full h-8 text-[10px] font-bold uppercase" size="sm">
                                            Analyze Record
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground/60">
                                    <p className="text-[9px] font-bold uppercase tracking-widest">Identify Feature</p>
                                    <p className="text-[8px] mt-1">Select an item on map</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="tools" className="flex-1 overflow-y-auto p-4 space-y-6 m-0">
                        {/* Drawing Tools Explanation */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-l-2 border-primary pl-2">
                                Digitizing Tools
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={activeTool === 'draw' ? 'default' : 'outline'}
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => setActiveTool('draw')}
                                >
                                    <MapIcon className="h-5 w-5" />
                                    <span className="text-[10px] font-bold uppercase">Draw Area</span>
                                </Button>
                                <Button
                                    variant={activeTool === 'measure' ? 'default' : 'outline'}
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => setActiveTool('measure')}
                                >
                                    <Ruler className="h-5 w-5" />
                                    <span className="text-[10px] font-bold uppercase">Measure</span>
                                </Button>
                            </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-l-2 border-primary pl-2">
                                Data Import (KML/CSV/SHP)
                            </h3>
                            <FileUploader onLayersUploaded={handleFileUpload} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Map Canvas */}
            <div className="flex-1 relative">
                <MapToolbar
                    activeTool={activeTool}
                    onToolSelect={setActiveTool}
                />

                <MapView className="h-full rounded-none border-none">
                    {/* Measurement Component */}
                    <MeasurementTool active={activeTool === 'measure'} />

                    {/* Drawing Component */}
                    <DrawingHandler
                        active={activeTool === 'draw'}
                        onDrawFinish={handleDrawFinish}
                    />

                    {/* Standard Layers */}
                    {activeLayers.compartments && (
                        <CompartmentLayer
                            compartments={filteredCompartments}
                            onSelect={(c) => setSelectedItem({ type: 'COMPARTMENT', data: c })}
                        />
                    )}

                    {activeLayers.permits && permitLocations.map((permit) => (
                        <PermitMarker
                            key={permit.id}
                            permit={permit}
                        />
                    ))}

                    {activeLayers.heatmap && hotspotData?.inventory && (
                        <HeatmapLayer
                            points={hotspotData.inventory}
                            autoFit={false}
                        />
                    )}

                    {/* Uploaded Layers */}
                    {uploadedLayers.map((layer) => (
                        <GeoJSON
                            key={layer.id}
                            data={layer.data}
                            style={{ color: '#f59e0b', weight: 2, fillOpacity: 0.1 }}
                            onEachFeature={(feature, l) => {
                                l.on('click', (e) => {
                                    L.DomEvent.stopPropagation(e)
                                    setSelectedItem({ type: layer.type, data: feature.properties })
                                })
                            }}
                        />
                    ))}
                </MapView>

                {/* Legend Overlay */}
                <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md p-3 rounded-lg border shadow-2xl z-[1000] w-48 transition-all hover:scale-105">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 border-b pb-1">Map Legend</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm bg-green-500/20 border-2 border-green-600" />
                            <span className="text-[10px] font-medium">Compartment boundary</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_5px_blue]" />
                            <span className="text-[10px] font-medium">Approved Permit</span>
                        </div>
                        {uploadedLayers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-amber-500/20 border-2 border-amber-600" />
                                <span className="text-[10px] font-medium">Imported Layer</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-8 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500" />
                            <span className="text-[10px] font-medium">Harvesting Heatmap</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
