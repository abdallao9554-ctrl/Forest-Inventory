import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"


export interface BreadcrumbItem {
    label: string
    href?: string
}

interface InventoryHeaderProps {
    title: string
    subtitle?: string
    breadcrumbs: BreadcrumbItem[]
    actions?: React.ReactNode
}

export function InventoryHeader({ title, subtitle, breadcrumbs, actions }: InventoryHeaderProps) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-muted-foreground">
                <Link to="/dashboard" className="hover:text-foreground flex items-center gap-1">
                    <Home className="h-4 w-4" />
                </Link>
                {breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <ChevronRight className="h-4 w-4 mx-1" />
                        {item.href ? (
                            <Link to={item.href} className="hover:text-foreground">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-foreground font-medium">{item.label}</span>
                        )}
                    </div>
                ))}
            </nav>

            {/* Title & Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            </div>
        </div>
    )
}
