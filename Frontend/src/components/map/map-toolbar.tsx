import { Button } from "@/components/ui/button"
import {
    Maximize2,
    Printer,
    Ruler,
    MousePointer2,
    MapPin,
    Download,
    Pencil
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MapToolbarProps {
    className?: string
    onToolSelect?: (tool: string) => void
    activeTool?: string
}

export function MapToolbar({ className, onToolSelect, activeTool }: MapToolbarProps) {
    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Select' },
        { id: 'measure', icon: Ruler, label: 'Measure Distance' },
        { id: 'draw', icon: Pencil, label: 'Draw Area' },
        { id: 'marker', icon: MapPin, label: 'Drop Pin' },
    ]

    return (
        <div className={cn("absolute top-4 left-14 z-[1000] flex flex-col gap-2 bg-background/90 backdrop-blur-md p-1.5 rounded-md border shadow-2xl", className)}>
            {tools.map((tool) => (
                <Button
                    key={tool.id}
                    variant={activeTool === tool.id ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                        "h-8 w-8 transition-all hover:scale-110",
                        activeTool === tool.id && "bg-primary text-primary-foreground shadow-lg"
                    )}
                    onClick={() => onToolSelect?.(tool.id)}
                    title={tool.label}
                >
                    <tool.icon className="h-4 w-4" />
                </Button>
            ))}

            <div className="h-px bg-border mx-1 my-1" />

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:scale-110"
                title="Print Map"
                onClick={() => window.print()}
            >
                <Printer className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:scale-110"
                title="Fullscreen"
                onClick={() => {
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    } else {
                        document.exitFullscreen();
                    }
                }}
            >
                <Maximize2 className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:scale-110"
                title="Export Data"
            >
                <Download className="h-4 w-4" />
            </Button>
        </div>
    )
}
