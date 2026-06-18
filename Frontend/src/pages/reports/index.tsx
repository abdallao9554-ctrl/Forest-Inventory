import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Download,
    TrendingUp,
    AlertCircle,
    Trees,
    FileJson,
    FileSpreadsheet,
    Map as MapIcon,
    Printer,
    Filter,
    Table as TableIcon,
    ChevronDown,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    History
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapView } from "@/components/map/map-view"
import { HeatmapLayer } from "@/components/map/heatmap-layer"
import { reportsApi } from "@/api/reports"
import { useLanguageStore } from "@/store/language-store"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"

const COMPLIANCE_COLORS = ['#10b981', '#ef4444', '#f59e0b']

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 backdrop-blur-sm border border-primary/10 rounded-xl shadow-2xl p-4 text-xs">
                <p className="font-bold mb-2 text-[10px] uppercase tracking-widest text-muted-foreground border-b pb-1">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                                <span className="font-semibold">{entry.name}:</span>
                            </div>
                            <span className="font-mono font-bold text-primary">{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return null
}

export default function ReportsPage() {
    const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'annual'>('monthly')
    const language = useLanguageStore((state) => state.language)
    const t = translations[language]

    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['reports', 'summary', timeframe],
        queryFn: () => reportsApi.getSummary(timeframe)
    })

    const { data: trends } = useQuery({
        queryKey: ['reports', 'trends', timeframe],
        queryFn: () => reportsApi.getTrends(timeframe)
    })

    const { data: speciesVolume } = useQuery({
        queryKey: ['reports', 'species-volume'],
        queryFn: reportsApi.getSpeciesVolume
    })

    const { data: spatialData } = useQuery({
        queryKey: ['reports', 'spatial'],
        queryFn: reportsApi.getSpatialData
    })

    const handleExportCSV = () => {
        if (!trends) return
        const headers = ['Period,Approved,Rejected,Expired']
        const rows = trends.map(d => `${d.name},${d.approved},${d.rejected},${d.expired}`)
        const csvContent = headers.concat(rows).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `forest_report_${timeframe}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleExportGeoJSON = () => {
        if (!spatialData) return
        const geoJson = {
            type: "FeatureCollection",
            features: spatialData.map((d) => ({
                type: "Feature",
                properties: { intensity: d.intensity },
                geometry: { type: "Point", coordinates: [d.lng, d.lat] }
            }))
        }

        const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `spatial_analytics_${timeframe}.geojson`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="flex flex-col space-y-6 min-h-full p-2 print:p-0 print:m-0 print:block">
            {/* Professional Print Header - ONLY visible during printing */}
            <div className="hidden print:block mb-8 border-b-2 border-primary pb-6">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                        <div className="bg-primary text-primary-foreground p-3 rounded-xl">
                            <MapIcon className="h-10 w-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight text-primary">Forest Inventory System</h1>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t.gisExplorer} & {t.permits} {t.reports}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-tighter">
                            {t.officialDocument}
                        </div>
                        <p className="text-xs font-bold text-foreground">{t.generated}: {new Date().toLocaleDateString(language === 'EN' ? 'en-GB' : 'sw-TZ', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-b py-4 border-dashed border-primary/20">
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t.reportSubject}</p>
                        <p className="text-sm font-bold">{t.forestOpsSummary}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t.reportingPeriod}</p>
                        <p className="text-sm font-bold capitalize">{timeframe} {t.review}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t.documentStatus}</p>
                        <p className="text-sm font-bold text-green-600">{t.verified}</p>
                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        /* Force orientation to portrait and set page size */
                        @page {
                            size: portrait;
                            margin: 10mm;
                        }

                        /* Target ONLY the report container for printing */
                        .no-print, header, aside, nav, [role="navigation"] { 
                            display: none !important; 
                            height: 0 !important;
                            width: 0 !important;
                            overflow: hidden !important;
                            visibility: hidden !important;
                        }

                        /* Global container resets for print */
                        body, #root, .h-screen, main, .flex-1 {
                            height: auto !important;
                            overflow: visible !important;
                            display: block !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            background: white !important;
                        }

                        .card { 
                            border: 1px solid #e5e7eb !important; 
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                            margin-bottom: 20px !important;
                            box-shadow: none !important;
                        }

                        /* Ensure graphics are sized correctly for print */
                        .leaflet-container, .recharts-responsive-container {
                            height: 450px !important;
                            min-height: 450px !important;
                            width: 100% !important;
                        }

                        .grid {
                            display: block !important;
                        }
                        
                        .grid > div {
                            width: 100% !important;
                            page-break-inside: avoid !important;
                            margin-bottom: 20px !important;
                        }
                    }
                `}
            </style>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Analytics Engine
                    </h1>
                    <p className="text-muted-foreground font-medium">Real-time forest operation intelligence and spatial forensics.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-muted/50 border rounded-xl p-1 shadow-inner">
                        {(['weekly', 'monthly', 'annual'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                                    timeframe === t
                                        ? 'bg-background shadow-md text-primary ring-1 ring-primary/10'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl">
                            <DropdownMenuItem onClick={() => window.print()} className="gap-3 py-3">
                                <Printer className="h-4 w-4 text-primary" />
                                <div className="flex flex-col">
                                    <span className="font-bold">Print Analysis</span>
                                    <span className="text-[10px] text-muted-foreground">Professional PDF report</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportCSV} className="gap-3 py-3">
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                <div className="flex flex-col">
                                    <span className="font-bold">Export Data</span>
                                    <span className="text-[10px] text-muted-foreground">Excel / CSV Format</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportGeoJSON} className="gap-3 py-3">
                                <FileJson className="h-4 w-4 text-blue-600" />
                                <div className="flex flex-col">
                                    <span className="font-bold">Spatial Dump</span>
                                    <span className="text-[10px] text-muted-foreground">GIS / GeoJSON Format</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden group border-primary/10 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-bold uppercase tracking-wider">Operational Revenue</CardDescription>
                            <TrendingUp className="h-4 w-4 text-primary opacity-50" />
                        </div>
                        <CardTitle className="text-3xl font-black tabular-nums">
                            {isLoadingSummary ? "---" : `TZS ${(summary!.totalRevenue / 1e6).toFixed(1)}M`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="flex items-center font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                <ArrowUpRight className="h-3 w-3 mr-0.5" /> {summary?.revenueTrend}
                            </span>
                            <span className="text-muted-foreground">vs prev period</span>
                        </div>
                    </CardContent>
                    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                </Card>

                <Card className="relative overflow-hidden group border-primary/10 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-bold uppercase tracking-wider">Active Permits</CardDescription>
                            <Trees className="h-4 w-4 text-primary opacity-50" />
                        </div>
                        <CardTitle className="text-3xl font-black tabular-nums">
                            {isLoadingSummary ? "---" : summary!.activePermits}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                {summary?.expiringPermits} Expiring
                            </span>
                            <span className="text-muted-foreground italic">Action required</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group border-primary/10 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-bold uppercase tracking-wider">Compliance Index</CardDescription>
                            <AlertCircle className="h-4 w-4 text-primary opacity-50" />
                        </div>
                        <CardTitle className="text-3xl font-black tabular-nums">
                            {isLoadingSummary ? "---" : `${summary!.complianceRate}%`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className={cn(
                                "flex items-center font-bold px-1.5 py-0.5 rounded-full",
                                summary?.complianceTrend.startsWith('+') ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                            )}>
                                {summary?.complianceTrend.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                {summary?.complianceTrend}
                            </span>
                            <span className="text-muted-foreground">Avg accuracy</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">Verified Volume</CardDescription>
                            <Calendar className="h-4 w-4 text-primary-foreground/50" />
                        </div>
                        <CardTitle className="text-3xl font-black tabular-nums">1.2k m³</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs font-medium text-primary-foreground/80">
                            Current Logging Quota: 85%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Visual Analytics */}
                <Card className="lg:col-span-4 border-primary/10 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Permit Lifecycle Trends</CardTitle>
                            <CardDescription>Volume of applications by outcome.</CardDescription>
                        </div>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={10}
                                    fontWeight="bold"
                                    tick={{ fill: 'currentColor', opacity: 0.6 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={10}
                                    fontWeight="bold"
                                    tick={{ fill: 'currentColor', opacity: 0.6 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                />
                                <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="expired" name="Expired" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Spatial Analytics */}
                <Card className="lg:col-span-3 border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Spatial Forensics</CardTitle>
                                <CardDescription>High-activity logging zones.</CardDescription>
                            </div>
                            <MapIcon className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 h-[350px]">
                        <MapView className="h-full w-full border-none">
                            {spatialData && <HeatmapLayer points={spatialData} radius={35} blur={25} />}
                        </MapView>
                    </CardContent>
                    <div className="p-4 bg-muted/20 border-t flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-8 bg-gradient-to-r from-blue-500 to-red-500 rounded-full" />
                            <span>Intensity Meter</span>
                        </div>
                        <Button variant="link" className="h-auto p-0 text-[10px] uppercase font-bold text-primary">Full Map Explorer</Button>
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Compliance Distribution */}
                <Card className="lg:col-span-3 border-primary/10 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Inspection Compliance</CardTitle>
                        <CardDescription>Outcome distribution for field visits.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Compliant', value: 35 },
                                        { name: 'Non-Compliant', value: 5 },
                                        { name: 'Pending Review', value: 8 },
                                    ]}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {[0, 1, 2].map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COMPLIANCE_COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" iconType="circle" />
                                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-black text-2xl">
                                    48
                                </text>
                                <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground font-bold text-[10px] uppercase tracking-tighter">
                                    Total Insp.
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Harvesting Volume Area Chart */}
                <Card className="lg:col-span-4 border-primary/10 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Resource Extraction</CardTitle>
                            <CardDescription>Verified volume by species categories.</CardDescription>
                        </div>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={speciesVolume}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="volume" name="Volume (m³)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Table */}
            <Card className="border-primary/10 shadow-sm no-print">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Summary of Operations</CardTitle>
                            <CardDescription>Tabular view of system performance metadata.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <TableIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-muted/50 text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b">
                                    <th className="px-6 py-4">Metric Category</th>
                                    <th className="px-6 py-4">Current Value</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action Log</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {[
                                    { category: 'Permit Issuance', value: '145 units', status: 'Healthy', color: 'text-green-600' },
                                    { category: 'Revenue Integrity', value: '94.2%', status: 'Audited', color: 'text-blue-600' },
                                    { category: 'Field Compliance', value: '12 Breach Alerts', status: 'Warning', color: 'text-red-600' },
                                    { category: 'Quota Usage', value: '85.4% Capacity', status: 'Peaked', color: 'text-amber-600' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 font-bold">{row.category}</td>
                                        <td className="px-6 py-4 font-mono">{row.value}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full border", row.color, row.color.replace('text', 'border'))}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right underline underline-offset-4 decoration-primary/20 hover:text-primary cursor-pointer text-xs font-semibold">
                                            View Logs
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
