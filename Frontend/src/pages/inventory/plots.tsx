import { useQuery } from "@tanstack/react-query"
import { Plus, Filter, Map as MapIcon, List } from "lucide-react"
import { useState } from "react"
import { Circle, LayersControl, Popup } from "react-leaflet"
import { useNavigate, useSearchParams } from "react-router-dom"

import { inventoryApi } from "@/api/inventory"
import { InventoryHeader } from "@/components/inventory/inventory-header"
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

export default function PlotsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const compartmentId = searchParams.get("compartment")

    const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split")

    const { data: plots } = useQuery({
        queryKey: ['plots', compartmentId],
        queryFn: () => inventoryApi.getPlots(compartmentId || undefined)
    })

    return (
        <div className="flex flex-col h-full space-y-4">
            <InventoryHeader
                title="Sample Plots"
                subtitle={compartmentId ? `Showing plots for Compartment ${compartmentId}` : "Manage inventory sample plots."}
                breadcrumbs={[
                    { label: "Inventory", href: "/inventory" },
                    { label: "Compartments", href: "/inventory/compartments" },
                    { label: "Plots" }
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
                            New Plot
                        </Button>
                    </>
                }
            />

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter by plot number..." className="pl-9" />
                </div>
            </div>

            <div className={`flex-1 min-h-0 grid gap-4 ${viewMode === "split" ? "grid-cols-2" : "grid-cols-1"}`}>
                {(viewMode === "list" || viewMode === "split") && (
                    <Card className="flex flex-col overflow-hidden">
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg">Plots List</CardTitle>
                        </CardHeader>
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Plot #</TableHead>
                                        <TableHead>Compartment</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plots?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No plots found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {plots?.map((plot) => (
                                        <TableRow
                                            key={plot.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/inventory/trees?plot=${plot.id}`)}
                                        >
                                            <TableCell className="font-medium">{plot.plotNumber}</TableCell>
                                            <TableCell>{plot.compartmentId}</TableCell>
                                            <TableCell>{plot.surveyDate}</TableCell>
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
                                <LayersControl.Overlay checked name="Plots">
                                    {plots?.map((plot) => (
                                        <Circle
                                            key={plot.id}
                                            center={[plot.geoJson.coordinates[1], plot.geoJson.coordinates[0]]}
                                            radius={50}
                                            pathOptions={{ color: 'orange' }}
                                        >
                                            <Popup>{plot.plotNumber}</Popup>
                                        </Circle>
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
