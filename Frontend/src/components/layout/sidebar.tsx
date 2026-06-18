import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Map,
    Trees,
    FileText,
    ClipboardCheck,
    BarChart3,
    Users,
    Settings,
    Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { useLanguageStore } from '@/store/language-store'
import { translations } from '@/lib/translations'

export function Sidebar() {
    const location = useLocation()
    const user = useAuthStore((state) => state.user)
    const language = useLanguageStore((state) => state.language)
    const t = translations[language]

    if (!user) return null

    const sidebarItems = [
        {
            title: t.dashboard,
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['ADMIN', 'OFFICER', 'INSPECTOR', 'VIEWER'],
        },
        {
            title: t.gisExplorer,
            href: '/gis',
            icon: Map,
            roles: ['ADMIN', 'OFFICER', 'INSPECTOR', 'VIEWER'],
        },
        {
            title: t.inventory,
            icon: Trees,
            roles: ['ADMIN', 'OFFICER', 'INSPECTOR', 'VIEWER'],
            children: [
                { title: t.compartments, href: '/inventory/compartments' },
                { title: t.plots, href: '/inventory/plots' },
                { title: t.trees, href: '/inventory/trees' },
            ]
        },
        {
            title: t.permits,
            href: '/permits',
            icon: FileText,
            roles: ['ADMIN', 'OFFICER', 'VIEWER'],
        },
        {
            title: t.inspection,
            href: '/inspection',
            icon: ClipboardCheck,
            roles: ['ADMIN', 'INSPECTOR'],
        },
        {
            title: t.reports,
            href: '/reports',
            icon: BarChart3,
            roles: ['ADMIN', 'OFFICER', 'INSPECTOR', 'VIEWER'],
        },
        {
            title: t.monitoring,
            href: '/monitoring',
            icon: Eye,
            roles: ['ADMIN', 'OFFICER', 'INSPECTOR', 'VIEWER'],
        },
        {
            title: t.userManagement,
            href: '/admin/users',
            icon: Users,
            roles: ['ADMIN'],
        },
    ]

    return (
        <aside className="hidden w-64 flex-col bg-card border-r md:flex h-screen sticky top-0 no-print">
            <div className="p-6 border-b flex items-center gap-2">
                <Map className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg tracking-tight">ForestInventory</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-2">
                    {sidebarItems.map((item) => {
                        if (item.roles && !item.roles.includes(user.role)) return null

                        if (item.children) {
                            return (
                                <div key={item.title} className="space-y-1">
                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <item.icon className="h-4 w-4" />
                                        {item.title}
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.href}
                                                to={child.href}
                                                className={cn(
                                                    "block px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                                                    location.pathname === child.href ? "bg-accent/50 text-accent-foreground font-medium" : "text-muted-foreground"
                                                )}
                                            >
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                                    location.pathname === item.href
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                    </div>
                    <Settings className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                </div>
            </div>
        </aside>
    )
}
