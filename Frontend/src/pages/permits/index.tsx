import { useQuery } from "@tanstack/react-query"
import { Plus, Filter } from "lucide-react"
import { Link } from "react-router-dom"

import { permitsApi } from "@/api/permits"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export default function PermitsPage() {
    const { data: permits } = useQuery({
        queryKey: ['permits'],
        queryFn: permitsApi.getPermits
    })

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string[]>(['APPROVED', 'PENDING', 'REJECTED', 'EXPIRED'])

    // Filter permits
    const filteredPermits = permits?.filter(permit => {
        const matchesSearch =
            permit.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            permit.applicant.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter.includes(permit.status)

        return matchesSearch && matchesStatus
    })

    const toggleStatusFilter = (status: string) => {
        setStatusFilter(current =>
            current.includes(status)
                ? current.filter(s => s !== status)
                : [...current, status]
        )
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Permits</h1>
                    <p className="text-muted-foreground">Manage tree felling permits.</p>
                </div>
                <Link to="/permits/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Permit
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by number or applicant..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter Status
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['APPROVED', 'PENDING', 'REJECTED', 'EXPIRED'].map((status) => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={statusFilter.includes(status)}
                                onCheckedChange={() => toggleStatusFilter(status)}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Card className="flex flex-col overflow-hidden">
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">All Permits</CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Permit #</TableHead>
                                <TableHead>Applicant</TableHead>
                                <TableHead>Area (ha)</TableHead>
                                <TableHead>Tree Count</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Issue Date</TableHead>
                                <TableHead className="text-right">Expiry Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPermits?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No permits found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredPermits?.map((permit) => (
                                <TableRow key={permit.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{permit.permitNumber}</TableCell>
                                    <TableCell>{permit.applicant}</TableCell>
                                    <TableCell>{permit.areaHa}</TableCell>
                                    <TableCell>{permit.treeCount}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={permit.status} />
                                    </TableCell>
                                    <TableCell>{permit.issueDate}</TableCell>
                                    <TableCell className="text-right">{permit.expiryDate}</TableCell>
                                    <TableCell>
                                        <Link to={`/permits/${permit.id}`}>
                                            <Button variant="ghost" size="sm">View</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let className = ""

    switch (status) {
        case 'APPROVED':
            variant = 'default'
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

    return <Badge variant={variant} className={className}>{status}</Badge>
}
