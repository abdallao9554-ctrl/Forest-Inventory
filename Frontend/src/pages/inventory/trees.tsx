import { useQuery } from "@tanstack/react-query"
import { Plus, Filter, Map as MapIcon, List } from "lucide-react"
import { useState } from "react"
import { CircleMarker, LayersControl, Popup } from "react-leaflet"
import { useSearchParams } from "react-router-dom"

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
import { Badge } from "@/components/ui/badge"

export default function TreesPage() {
    const [searchParams] = useSearchParams()
    const plotId = searchParams.get("plot")

    const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split")

    const { data: trees } = useQuery({
        queryKey: ['trees', plotId],
        queryFn: () => inventoryApi.getTrees(plotId || undefined)
    })

    return (
        <div className="flex flex-col h-full space-y-4">
            <InventoryHeader
                title="Tree Inventory"
                subtitle={plotId ? `Showing trees for Plot ${plotId}` : "Individual tree records and status."}
                breadcrumbs={[
                    { label: "Inventory", href: "/inventory" },
                    { label: "Compartments", href: "/inventory/compartments" },
                    { label: "Plots", href: "/inventory/plots" },
                    { label: "Trees" }
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
                            New Tree
                        </Button>
                    </>
                }
            />

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter by species..." className="pl-9" />
                </div>
            </div>

            <div className={`flex-1 min-h-0 grid gap-4 ${viewMode === "split" ? "grid-cols-2" : "grid-cols-1"}`}>
                {(viewMode === "list" || viewMode === "split") && (
                    <Card className="flex flex-col overflow-hidden">
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg">Tree List</CardTitle>
                        </CardHeader>
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                    <TableRow>
                                        <TableHead>Species</TableHead>
                                        <TableHead>DBH (cm)</TableHead>
                                        <TableHead>Height (m)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trees?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No trees found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {trees?.map((tree) => (
                                        <TableRow key={tree.id}>
                                            <TableCell className="font-medium">{tree.speciesCode}</TableCell>
                                            <TableCell>{tree.dbh}</TableCell>
                                            <TableCell>{tree.height}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{tree.status}</Badge>
                                            </TableCell>
                                            <TableCell>
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
                                <LayersControl.Overlay checked name="Trees">
                                    {trees?.map((tree) => (
                                        <CircleMarker
                                            key={tree.id}
                                            center={[tree.geoJson.coordinates[1], tree.geoJson.coordinates[0]]}
                                            radius={5}
                                            pathOptions={{
                                                color: tree.status === 'HARVESTED' ? 'red' : 'green',
                                                fillOpacity: 0.7
                                            }}
                                        >
                                            <Popup>
                                                Species: {tree.speciesCode}<br />
                                                DBH: {tree.dbh}
                                            </Popup>
                                        </CircleMarker>
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
