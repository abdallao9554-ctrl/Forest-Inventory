import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Calendar, User, FileText, CheckCircle, AlertTriangle, MapPin, ClipboardCheck, Info } from "lucide-react"
import { inspectionApi } from "@/api/inspection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapView } from "@/components/map/map-view"
import { Marker } from "react-leaflet"
import L from 'leaflet'

// Fix for default marker icon in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

export default function InspectionDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data: inspection, isLoading } = useQuery({
        queryKey: ['inspection', id],
        queryFn: () => inspectionApi.getInspection(id as string),
        enabled: !!id
    })

    const handlePrint = () => {
        window.print()
    }

    const handleEdit = () => {
        navigate(`/inspection/${id}/edit`)
    }

    const handleAttachmentClick = (name: string) => {
        alert(`Opening attachment: ${name}`)
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading inspection details...</p>
                </div>
            </div>
        )
    }

    if (!inspection) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Inspection Not Found</h2>
                <Button onClick={() => navigate('/inspection')}>Back to List</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6 max-w-6xl mx-auto p-4 md:p-8 print:p-0">
            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
                        .print-border { border: 1px solid #e2e8f0 !important; }
                        .card-shadow { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
                    }
                `}
            </style>

            <div className="flex items-center justify-between no-print">
                <Button variant="ghost" onClick={() => navigate('/inspection')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Inspections
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleEdit}>Edit Inspection</Button>
                    <Button onClick={handlePrint}>Print Report</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm card-shadow">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inspection ID</div>
                                    <CardTitle className="text-2xl">{inspection.id}</CardTitle>
                                </div>
                                <StatusBadge status={inspection.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary print:border print:bg-white">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Inspection Date</p>
                                            <p className="text-sm text-muted-foreground">{inspection.inspectionDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary print:border print:bg-white">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Inspector</p>
                                            <p className="text-sm text-muted-foreground">{inspection.inspectorName}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary print:border print:bg-white">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Permit Reference</p>
                                            <p className="text-sm text-primary hover:underline cursor-pointer" onClick={() => navigate(`/permits/${inspection.permitId}`)}>
                                                {inspection.permitNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary print:border print:bg-white">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Coordinates</p>
                                            <p className="text-sm text-muted-foreground">{inspection.location.lat}, {inspection.location.lng}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Key Findings</h3>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {inspection.findings.map((finding, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-3 rounded-md bg-muted/30 border print:bg-white">
                                            {inspection.status === 'COMPLIANT' ? (
                                                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
                                            )}
                                            <span className="text-sm">{finding}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Info className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Inspector's Notes</h3>
                                </div>
                                <div className="p-4 rounded-md bg-muted/30 border text-sm italic text-muted-foreground leading-relaxed print:bg-white">
                                    "{inspection.notes}"
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Map & Extras */}
                <div className="space-y-6">
                    <Card className="shadow-sm overflow-hidden card-shadow">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-lg">Location Context</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[300px] w-full print:h-[250px]">
                                <MapView
                                    center={[inspection.location.lat, inspection.location.lng]}
                                    zoom={15}
                                    className="h-full w-full border-none"
                                >
                                    <Marker position={[inspection.location.lat, inspection.location.lng]} />
                                </MapView>
                            </div>
                            <div className="p-4 text-xs text-muted-foreground bg-muted/10 print:bg-white print:border-t">
                                <p>Verified location for field inspection {inspection.id}. Harvest area compartment 4B.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm card-shadow no-print">
                        <CardHeader>
                            <CardTitle className="text-lg">Photos & Documentation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => handleAttachmentClick("Stump Inspection Photo 1")}
                                >
                                    <div className="p-2 bg-background rounded-full mb-1">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-[10px] text-center px-2">Stump Inspection</p>
                                </div>
                                <div
                                    className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => handleAttachmentClick("Log Marking Photo 2")}
                                >
                                    <div className="p-2 bg-background rounded-full mb-1">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-[10px] text-center px-2">Log Markings</p>
                                </div>
                            </div>
                            <Button variant="link" className="w-full mt-2 h-auto p-0 text-xs" onClick={() => alert("Viewing all 5 attachments...")}>
                                View all attachments (5)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let className = ""

    switch (status) {
        case 'COMPLIANT':
            variant = 'default'
            className = "bg-green-600 hover:bg-green-700"
            break
        case 'NON_COMPLIANT':
            variant = 'destructive'
            break
        case 'NEEDS_REVIEW':
            variant = 'secondary'
            className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            break
    }

    return <Badge variant={variant} className={className + " px-3 py-1"}>{status.replace('_', ' ')}</Badge>
}
