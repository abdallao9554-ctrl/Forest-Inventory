import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Calendar, FileText, Trees, Printer, CheckCircle2, XCircle, MapPin, ClipboardList, Info, ClipboardCheck } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { permitsApi } from "@/api/permits"
import { MapView } from "@/components/map/map-view"
import { PermitMarker } from "@/components/map/permit-marker"
import { dashboardApi } from "@/api/dashboard"
import { inventoryApi } from "@/api/inventory"
import { cn } from "@/lib/utils"

export default function PermitDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'EXPIRE' | null>(null)
    const [actionNote, setActionNote] = useState('')

    const { data: permits, isLoading: isLoadingPermits } = useQuery({
        queryKey: ['permits'],
        queryFn: permitsApi.getPermits
    })

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ status, note }: { status: 'APPROVED' | 'REJECTED' | 'EXPIRED', note: string }) =>
            permitsApi.updatePermitStatus(id as string, status, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permits'] })
            setIsActionDialogOpen(false)
            setActionType(null)
            setActionNote('')
        }
    })

    // Find permit by ID (mock implementation)
    const permit = permits?.find(p => p.id === id) || (permits ? permits[0] : null)

    // Mock location data for map
    const { data: permitLocations } = useQuery({
        queryKey: ['dashboard', 'permit-locations'],
        queryFn: dashboardApi.getPermitLocations
    })

    const permitLocation = permitLocations?.find(p => p.permitNumber === permit?.permitNumber)

    // Fetch linked inventory trees
    const { data: selectedTrees } = useQuery({
        queryKey: ['inventory', 'trees', permit?.selectedTreeIds],
        queryFn: () => inventoryApi.getTreesByIds(permit?.selectedTreeIds || []),
        enabled: !!permit?.selectedTreeIds?.length
    })

    const handlePrint = () => {
        window.print()
    }

    const openActionDialog = (type: 'APPROVE' | 'REJECT' | 'EXPIRE') => {
        setActionType(type)
        setIsActionDialogOpen(true)
    }

    if (isLoadingPermits) {
        return <div className="p-8 text-center italic text-muted-foreground">Loading permit details...</div>
    }

    if (!permit) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Permit Not Found</h2>
                <Button onClick={() => navigate('/permits')}>Back to List</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full space-y-6 print:space-y-4">
            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
                        .print-container { padding: 0 !important; }
                        .card-shadow { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
                    }
                `}
            </style>

            {/* Header */}
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/permits')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{permit.permitNumber}</h1>
                        <p className="text-muted-foreground font-medium">Applicant: {permit.applicant}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge status={permit.status} size="lg" />
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Permit
                    </Button>

                    <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                        {permit.status === 'PENDING' && (
                            <>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => openActionDialog('REJECT')}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => openActionDialog('APPROVE')}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            </>
                        )}
                        {permit.status === 'APPROVED' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => openActionDialog('EXPIRE')}
                                disabled={updateStatusMutation.isPending}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Mark as Expired
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Print Header (Visible only when printing) */}
            <div className="hidden print:block border-b pb-4 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">FELLING PERMIT REPORT</h1>
                        <p className="text-sm font-bold text-primary">{permit.permitNumber}</p>
                    </div>
                    <StatusBadge status={permit.status} size="lg" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">Issued by Tanzania Forest Service (TFS) System</p>
            </div>

            <Tabs defaultValue="details" className="h-full flex flex-col no-print">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="details">Details & Summary</TabsTrigger>
                    <TabsTrigger value="map">Area Boundary</TabsTrigger>
                    <TabsTrigger value="inventory">Tree Inventory</TabsTrigger>
                    <TabsTrigger value="inspections">Inspections (2)</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 mt-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="card-shadow">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-primary" />
                                    General Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4 text-sm">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground block">Permit Reference:</span>
                                    <span className="font-bold text-base">{permit.permitNumber}</span>
                                </div>
                                <Separator />
                                <div className="space-y-1">
                                    <span className="text-muted-foreground block">Applicant Name:</span>
                                    <span className="font-medium text-base">{permit.applicant}</span>
                                </div>
                                <Separator />
                                <div className="space-y-1">
                                    <span className="text-muted-foreground block">Permit Status:</span>
                                    <StatusBadge status={permit.status} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-shadow">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Permit Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Application Date:</span>
                                    <span className="font-medium">{permit.issueDate}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center text-green-700">
                                    <span className="font-medium">Issue Date:</span>
                                    <span className="font-bold">{permit.issueDate}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center text-red-700">
                                    <span className="font-medium">Expiry Date:</span>
                                    <span className="font-bold">{permit.expiryDate}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-shadow no-print">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="text-lg">Photos & Documentation</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div
                                        className="aspect-video bg-muted rounded-md flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => alert("Opening Supporting Doc 1")}
                                    >
                                        <FileText className="h-4 w-4 text-muted-foreground mb-1" />
                                        <p className="text-[10px]">Land Agreement</p>
                                    </div>
                                    <div
                                        className="aspect-video bg-muted rounded-md flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => alert("Opening Supporting Doc 2")}
                                    >
                                        <FileText className="h-4 w-4 text-muted-foreground mb-1" />
                                        <p className="text-[10px]">TFS Approval</p>
                                    </div>
                                </div>
                                <Button variant="link" className="w-full mt-2 h-auto p-0 text-xs">View all 4 attachments</Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6 card-shadow no-print overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">District Officer's Notes</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                "This permit application follows the forest inventory verification conducted on {permit.issueDate}. All selected trees are within the compartment boundaries and comply with the species harvesting regulations for the current season."
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="map" className="flex-1 mt-4 min-h-[450px]">
                    <Card className="h-full flex flex-col card-shadow">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Felling Coordinate Map
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden rounded-b-lg relative min-h-[450px]">
                            <MapView zoom={14} center={permitLocation ? [permitLocation.lat, permitLocation.lng] : undefined}>
                                {permitLocation && <PermitMarker permit={{ ...permitLocation, status: permit.status as any }} />}
                            </MapView>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="flex-1 mt-4">
                    <Card className="card-shadow">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                Marked Inventory
                            </CardTitle>
                            <CardDescription>Detailed registry of trees allowed for harvesting.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {!selectedTrees || selectedTrees.length === 0 ? (
                                <div className="flex items-center justify-center p-12 text-muted-foreground flex-col gap-3">
                                    <Trees className="h-16 w-16 opacity-20" />
                                    <p className="text-lg font-medium">No trees linked to this permit.</p>
                                </div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden border-muted-foreground/10">
                                    <Table>
                                        <TableHeader className="bg-muted/50 font-bold">
                                            <TableRow>
                                                <TableHead className="w-[120px]">Tree ID</TableHead>
                                                <TableHead>Species</TableHead>
                                                <TableHead>DBH (cm)</TableHead>
                                                <TableHead>Height (m)</TableHead>
                                                <TableHead className="text-right">Vol (m³)</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedTrees.map((tree) => (
                                                <TableRow key={tree.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-mono text-xs font-bold text-primary">
                                                        {tree.id}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{tree.speciesCode}</TableCell>
                                                    <TableCell>{tree.dbh}</TableCell>
                                                    <TableCell>{tree.height}</TableCell>
                                                    <TableCell className="text-right font-medium">{(tree.dbh * tree.height * 0.005).toFixed(2)}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            {tree.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inspections" className="flex-1 mt-4">
                    <Card className="card-shadow">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5 text-primary" />
                                Related Field Inspections
                            </CardTitle>
                            <CardDescription>Records of physical site verifications.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                <div className="flex p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate('/inspection/INS-001')}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold">INS-001</span>
                                            <Badge className="bg-green-600">COMPLIANT</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Conducted by Jane Ranger on 2023-11-15</p>
                                    </div>
                                    <Button variant="ghost" size="sm">Details</Button>
                                </div>
                                <div className="flex p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate('/inspection/INS-002')}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold">INS-002</span>
                                            <Badge variant="destructive">NON_COMPLIANT</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Conducted by John Warden on 2023-11-20</p>
                                    </div>
                                    <Button variant="ghost" size="sm">Details</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Print View Content (Visible only when printing) */}
            <div className="hidden print:block space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-bold border-b pb-1">Applicant Details</h3>
                        <div className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Name:</span> {permit.applicant}</p>
                            <p><span className="text-muted-foreground">License ID:</span> LIC-0092-2023</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold border-b pb-1">Permit Validity</h3>
                        <div className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Issued:</span> {permit.issueDate}</p>
                            <p><span className="text-muted-foreground">Expires:</span> {permit.expiryDate}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold border-b pb-1">Harvesting Area & Summary</h3>
                    <div className="text-sm grid grid-cols-4 gap-4">
                        <div className="p-3 border rounded text-center">
                            <p className="text-xs text-muted-foreground">Trees</p>
                            <p className="font-bold text-lg">{permit.treeCount}</p>
                        </div>
                        <div className="p-3 border rounded text-center">
                            <p className="text-xs text-muted-foreground">Area (ha)</p>
                            <p className="font-bold text-lg">{permit.areaHa}</p>
                        </div>
                        <div className="p-3 border rounded text-center">
                            <p className="text-xs text-muted-foreground">Est. Volume</p>
                            <p className="font-bold text-lg">450.2 m³</p>
                        </div>
                        <div className="p-3 border rounded text-center">
                            <p className="text-xs text-muted-foreground">Inspector</p>
                            <p className="font-bold text-sm">Janeth Ranger</p>
                        </div>
                    </div>
                </div>

                <div className="pt-20 mt-20 border-t">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="text-center pt-8">
                            <div className="border-b w-48 mx-auto h-2"></div>
                            <p className="text-xs mt-2 uppercase font-bold">Officer Signature</p>
                        </div>
                        <div className="text-center pt-8">
                            <div className="border-b w-48 mx-auto h-2"></div>
                            <p className="text-xs mt-2 uppercase font-bold">Official TFS Stamp</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval/Rejection/Expire Dialog */}
            {isActionDialogOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle className={cn(
                                "flex items-center gap-2 text-xl",
                                actionType === 'APPROVE' ? "text-green-600" :
                                    actionType === 'REJECT' ? "text-red-600" : "text-amber-600"
                            )}>
                                {actionType === 'APPROVE' ? <CheckCircle2 className="h-6 w-6" /> :
                                    actionType === 'REJECT' ? <XCircle className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                                {actionType === 'APPROVE' ? 'Approve Permit Application' :
                                    actionType === 'REJECT' ? 'Reject Permit Application' : 'Mark Permit as Expired'}
                            </CardTitle>
                            <CardDescription>
                                Are you sure you want to {actionType === 'EXPIRE' ? 'expire' : actionType?.toLowerCase()} permit <strong>{permit.permitNumber}</strong> for <strong>{permit.applicant}</strong>?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="action-note">Official Reason / Feedback (Optional)</Label>
                                <textarea
                                    id="action-note"
                                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder={
                                        actionType === 'APPROVE' ? "Add any approval stickers or notes..." :
                                            actionType === 'REJECT' ? "Reason for rejection..." : "Notes on expiration..."
                                    }
                                    value={actionNote}
                                    onChange={(e) => setActionNote(e.target.value)}
                                />
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                                <p>This action will be logged and the permit status will be updated immediately.</p>
                            </div>
                        </CardContent>
                        <div className="flex items-center justify-end p-6 border-t gap-3 uppercase tracking-wider font-bold text-xs">
                            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} disabled={updateStatusMutation.isPending}>
                                Cancel
                            </Button>
                            <Button
                                variant={actionType === 'APPROVE' ? 'default' : actionType === 'REJECT' ? 'destructive' : 'outline'}
                                className={cn(
                                    actionType === 'APPROVE' && "bg-green-600 hover:bg-green-700 text-white",
                                    actionType === 'EXPIRE' && "border-amber-500 text-amber-600 hover:bg-amber-50"
                                )}
                                onClick={() => updateStatusMutation.mutate({
                                    status: (actionType === 'EXPIRE' ? 'EXPIRED' : actionType) as any,
                                    note: actionNote
                                })}
                                disabled={updateStatusMutation.isPending}
                            >
                                {updateStatusMutation.isPending ? 'Processing...' : `Confirm ${actionType}`}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

// Reuse StatusBadge and Table components as needed
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

function StatusBadge({ status, size = "default" }: { status: string, size?: "default" | "lg" }) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let className = ""

    switch (status) {
        case 'APPROVED':
            variant = 'default'
            className = "bg-green-600 hover:bg-green-700"
            break
        case 'PENDING':
            variant = 'secondary'
            className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
            break
        case 'REJECTED':
            variant = 'destructive'
            break
        case 'EXPIRED':
            variant = 'outline'
            break
    }

    if (size === 'lg') {
        className += " text-base px-4 py-1 h-auto font-bold"
    }

    return <Badge variant={variant} className={className}>{status}</Badge>
}

