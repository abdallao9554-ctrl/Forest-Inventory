import { useQuery } from "@tanstack/react-query"
import { Plus, Filter, Map as MapIcon, List } from "lucide-react"
import { useState } from "react"
import { GeoJSON, LayersControl } from "react-leaflet"
import { useNavigate } from "react-router-dom"

import { InventoryHeader } from "@/components/inventory/inventory-header"

import { inventoryApi } from "@/api/inventory"
import { MapView } from "@/components/map/map-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function CompartmentsPage() {
    const navigate = useNavigate()
    const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split")

    const { data: compartments } = useQuery({
        queryKey: ['compartments'],
        queryFn: inventoryApi.getCompartments
    })

    return (
        <div className="flex flex-col h-full space-y-4">
            <InventoryHeader
                title="Compartments"
                subtitle="Manage forest compartments and zones."
                breadcrumbs={[
                    { label: "Inventory", href: "/inventory" },
                    { label: "Compartments" }
                ]}
                actions={
                    <>
                        <div className="flex bg-muted rounded-lg p-1">
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "split" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("split")}
                                className="h-8 px-2 text-xs"
                            >
                                Split
                            </Button>
                            <Button
                                variant={viewMode === "map" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("map")}
                                className="h-8 w-8 p-0"
                            >
                                <MapIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Compartment
                        </Button>
                    </>
                }
            />

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter by name..." className="pl-9" />
                </div>
                {/* More filters would go here */}
            </div>

            <div className={`flex-1 min-h-0 grid gap-4 ${viewMode === "split" ? "grid-cols-2" : "grid-cols-1"}`}>
                {(viewMode === "list" || viewMode === "split") && (
                    <Card className="flex flex-col overflow-hidden">
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg">Compartment List</CardTitle>
                        </CardHeader>
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Forest</TableHead>
                                        <TableHead>Area (ha)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {compartments?.map((comp) => (
                                        <TableRow
                                            key={comp.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/inventory/plots?compartment=${comp.id}`)}
                                        >
                                            <TableCell className="font-medium">{comp.name}</TableCell>
                                            <TableCell>{comp.forestName}</TableCell>
                                            <TableCell>{comp.areaHa}</TableCell>
                                            <TableCell>
                                                <Badge variant={comp.protectionStatus === 'PROTECTED' ? 'destructive' : 'default'} className="text-[10px]">
                                                    {comp.protectionStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}

                {(viewMode === "map" || viewMode === "split") && (
                    <Card className="flex flex-col overflow-hidden">
                        <div className="flex-1 bg-muted relative">
                            <MapView className="h-full border-none rounded-none">
                                <LayersControl.Overlay checked name="Compartments">
                                    {compartments?.map((comp) => (
                                        <GeoJSON
                                            key={comp.id}
                                            data={comp.geoJson}
                                            style={{
                                                color: comp.protectionStatus === 'PROTECTED' ? '#ef4444' : '#10b981',
                                                weight: 2,
                                                fillOpacity: 0.2
                                            }}
                                            onEachFeature={(_, layer) => {
                                                layer.bindPopup(`
                                            <b>${comp.name}</b><br/>
                                            Area: ${comp.areaHa} ha<br/>
                                            Status: ${comp.protectionStatus}
                                        `)
                                            }}
                                        />
                                    ))}
                                </LayersControl.Overlay>
                            </MapView>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
