import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: string
}

export function KpiCard({ title, value, icon: Icon, description, trend }: KpiCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && <span className="text-primary font-medium mr-1">{trend}</span>}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
