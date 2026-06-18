import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search, FileText, AlertTriangle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { inspectionApi } from "@/api/inspection"

export default function InspectionPage() {
    const navigate = useNavigate()
    const { data: inspections = [], isLoading } = useQuery({
        queryKey: ['inspections'],
        queryFn: inspectionApi.getInspections
    })

    return (
        <div className="flex flex-col space-y-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inspections</h1>
                    <p className="text-muted-foreground">Manage and track field inspections for felling permits.</p>
                </div>
                <Button onClick={() => navigate('/inspection/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Inspection
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inspections.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {inspections.filter(i => i.status === 'NON_COMPLIANT').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Compliant Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {inspections.length > 0
                                ? Math.round((inspections.filter(i => i.status === 'COMPLIANT').length / inspections.length) * 100)
                                : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="flex-1">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Inspections</CardTitle>
                            <CardDescription>A list of recent field inspections.</CardDescription>
                        </div>
                        <div className="flex w-[250px] items-center space-x-2">
                            <Input placeholder="Search inspections..." />
                            <Button size="icon" variant="ghost">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Inspection ID</TableHead>
                                <TableHead>Permit Number</TableHead>
                                <TableHead>Inspector</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Loading inspections...</TableCell>
                                </TableRow>
                            ) : inspections.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No inspections found.</TableCell>
                                </TableRow>
                            ) : (
                                inspections.map((inspection) => (
                                    <TableRow key={inspection.id}>
                                        <TableCell className="font-medium">{inspection.id}</TableCell>
                                        <TableCell>{inspection.permitNumber}</TableCell>
                                        <TableCell>{inspection.inspectorName}</TableCell>
                                        <TableCell>{inspection.inspectionDate}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={inspection.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/inspection/${inspection.id}`)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
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

    return <Badge variant={variant} className={className}>{status.replace('_', ' ')}</Badge>
}
