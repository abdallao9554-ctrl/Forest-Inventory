import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PermitSummary } from "@/api/dashboard"
import { useLanguageStore } from "@/store/language-store"
import { translations } from "@/lib/translations"

interface PermitTableProps {
    permits: PermitSummary[]
}

export function PermitTable({ permits }: PermitTableProps) {
    const language = useLanguageStore((state) => state.language)
    const t = translations[language]

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">{t.permitId}</TableHead>
                    <TableHead>{t.applicant}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.issueDate}</TableHead>
                    <TableHead className="text-right">{t.expiryDate}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {permits.map((permit) => (
                    <TableRow key={permit.id}>
                        <TableCell className="font-medium">{permit.permitNumber}</TableCell>
                        <TableCell>{permit.applicant}</TableCell>
                        <TableCell>
                            <StatusBadge status={permit.status} t={t} />
                        </TableCell>
                        <TableCell>{permit.issueDate}</TableCell>
                        <TableCell className="text-right">{permit.expiryDate}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function StatusBadge({ status, t }: { status: string, t: any }) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let className = ""
    let label = status

    switch (status) {
        case 'APPROVED':
            variant = 'default'
            label = t.approved
            break
        case 'PENDING':
            variant = 'secondary'
            className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
            label = t.pending
            break
        case 'REJECTED':
            variant = 'destructive'
            label = t.rejected
            break
        case 'EXPIRED':
            variant = 'outline'
            label = t.expired
            break
    }

    return <Badge variant={variant} className={className}>{label}</Badge>
}
