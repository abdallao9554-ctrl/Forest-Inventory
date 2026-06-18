import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useAuthStore } from '@/store/auth-store'

export function Layout() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground print:h-auto print:overflow-visible">
            <div className="no-print">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden print:overflow-visible">
                <div className="no-print">
                    <Header />
                </div>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
