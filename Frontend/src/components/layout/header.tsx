import { Bell, LogOut, Search, Globe, ChevronDown } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { useAuthStore } from '@/store/auth-store'
import { useLanguageStore } from '@/store/language-store'
import { useNavigate } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function Header() {
    const logout = useAuthStore((state) => state.logout)
    const { language, setLanguage } = useLanguageStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm no-print">
            <div className="flex-1">
                <div className="relative w-full max-w-sm hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={language === 'EN' ? "Search inventory, permits..." : "Tafuta rasilimali, vibali..."}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-accent text-muted-foreground h-9 rounded-md transition-all">
                            <Globe className="h-4 w-4" />
                            <span className="font-bold text-xs">{language}</span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-2xl">
                        <DropdownMenuItem
                            onClick={() => setLanguage('EN')}
                            className={language === 'EN' ? "bg-primary/5 text-primary font-bold" : ""}
                        >
                            <span className="flex-1">English</span>
                            {language === 'EN' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setLanguage('SW')}
                            className={language === 'SW' ? "bg-primary/5 text-primary font-bold" : ""}
                        >
                            <span className="flex-1">Kiswahili</span>
                            {language === 'SW' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-4 w-[1px] bg-border mx-1" />

                <button className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground relative transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
                </button>
                <ModeToggle />
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                    title={language === 'EN' ? "Logout" : "Ondoka"}
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    )
}
