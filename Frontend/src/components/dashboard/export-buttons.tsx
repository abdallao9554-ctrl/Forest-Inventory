import { Button } from "@/components/ui/button"
import { Download, FileDown, Printer } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguageStore } from "@/store/language-store"
import { translations } from "@/lib/translations"

interface ExportButtonsProps {
    onExportMap: () => void
    onExportCSV: () => void
    onPrint: () => void
}

export function ExportButtons({ onExportMap, onExportCSV, onPrint }: ExportButtonsProps) {
    const language = useLanguageStore((state) => state.language)
    const t = translations[language]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t.export}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t.exportOptions}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportMap}>
                    <FileDown className="h-4 w-4 mr-2" />
                    {t.exportMapPNG}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    {t.exportDataCSV}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onPrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    {t.printDashboard}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
