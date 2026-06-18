import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
    FileCheck,
    Trees,
    Scale,
    CheckCircle2,
    Loader2
} from "lucide-react"

import { dashboardApi } from "@/api/dashboard"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { OverviewChart, SpeciesChart } from "@/components/dashboard/charts"
import { PermitTable } from "@/components/dashboard/permit-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapView } from "@/components/map/map-view"
import { HeatmapLayer } from "@/components/map/heatmap-layer"
import { PermitMarker, type PermitLocation } from "@/components/map/permit-marker"
import { MapNavigator } from "@/components/map/map-navigator"
import { HotspotFilters, type HotspotCategory } from "@/components/dashboard/hotspot-filters"
import { SearchBar } from "@/components/dashboard/search-bar"
import { ExportButtons } from "@/components/dashboard/export-buttons"
import { exportMapAsImage, exportDataAsCSV, printDashboard } from "@/lib/export-utils"
import { useLanguageStore } from "@/store/language-store"
import { translations } from "@/lib/translations"

export default function DashboardPage() {
    const language = useLanguageStore((state) => state.language)
    const t = translations[language]
    const [hotspotCategory, setHotspotCategory] = useState<HotspotCategory>('combined')
    const [selectedPermit, setSelectedPermit] = useState<PermitLocation | null>(null)
    const { data: kpis, isLoading: isLoadingKpis } = useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: dashboardApi.getKpis
    })

    const { data: charts, isLoading: isLoadingCharts } = useQuery({
        queryKey: ['dashboard', 'charts'],
        queryFn: dashboardApi.getCharts
    })

    const { data: permits, isLoading: isLoadingPermits } = useQuery({
        queryKey: ['dashboard', 'permits'],
        queryFn: dashboardApi.getRecentPermits
    })

    const { data: hotspotData, isLoading: isLoadingHotspots } = useQuery({
        queryKey: ['dashboard', 'hotspots'],
        queryFn: dashboardApi.getHotspotData
    })

    const { data: permitLocations, isLoading: isLoadingPermits2 } = useQuery<PermitLocation[]>({
        queryKey: ['dashboard', 'permit-locations'],
        queryFn: dashboardApi.getPermitLocations
    })

    // Get the active hotspot data based on filter
    const activeHotspots = hotspotData?.[hotspotCategory] || []

    // Show permit markers when viewing permits or combined
    const showPermitMarkers = hotspotCategory === 'permits' || hotspotCategory === 'combined'

    if (isLoadingKpis || isLoadingCharts || isLoadingPermits || isLoadingHotspots || isLoadingPermits2) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm font-medium">{t.loading}</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t.dashboard}</h1>
                <div className="flex items-center gap-3">
                    <SearchBar
                        permits={permitLocations || []}
                        onSelectPermit={(permit) => setSelectedPermit(permit)}
                    />
                    <ExportButtons
                        onExportMap={() => exportMapAsImage('hotspot-map-container', 'forest-hotspot-map.png')}
                        onExportCSV={() => exportDataAsCSV(activeHotspots, `hotspot-data-${hotspotCategory}.csv`)}
                        onPrint={printDashboard}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title={t.activePermits}
                    value={kpis?.activePermits ?? 0}
                    icon={FileCheck}
                    description={t.currentlyActive}
                    trend="+10%"
                />
                <KpiCard
                    title={t.approvedVolume}
                    value={`${kpis?.approvedVolume?.toLocaleString()} m³`}
                    icon={Scale}
                    description={t.totalThisYear}
                />
                <KpiCard
                    title={t.harvestedVolume}
                    value={`${kpis?.harvestedVolume?.toLocaleString()} m³`}
                    icon={Trees}
                    description={t.verifiedHarvested}
                />
                <KpiCard
                    title={t.treesVerified}
                    value={kpis?.treesVerified?.toLocaleString() ?? '0'}
                    icon={CheckCircle2}
                    description={`${t.successRate} 98%`}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                <Card className="col-span-7">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{t.treeHotspots}</CardTitle>
                                <CardDescription>
                                    {t.hotspotDescription}
                                </CardDescription>
                            </div>
                            <HotspotFilters
                                activeCategory={hotspotCategory}
                                onCategoryChange={setHotspotCategory}
                            />
                        </div>
                    </CardHeader>
                    <CardContent id="hotspot-map-container">
                        <MapView className="h-[400px]">
                            {activeHotspots && activeHotspots.length > 0 && (
                                <HeatmapLayer
                                    points={activeHotspots}
                                    radius={30}
                                    blur={20}
                                    max={1.0}
                                    autoFit={true}
                                />
                            )}
                            {showPermitMarkers && permitLocations?.map((permit) => (
                                <PermitMarker key={permit.id} permit={permit} />
                            ))}
                            {selectedPermit && (
                                <MapNavigator
                                    targetLat={selectedPermit.lat}
                                    targetLng={selectedPermit.lng}
                                    zoom={15}
                                />
                            )}
                        </MapView>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t.harvestingOverview}</CardTitle>
                        <CardDescription>{t.monthlyTrends}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={charts?.monthly || []} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t.speciesDistribution}</CardTitle>
                        <CardDescription>
                            {t.volumeBySpecies}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SpeciesChart data={charts?.species || []} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7">
                    <CardHeader>
                        <CardTitle>{t.recentPermits}</CardTitle>
                        <CardDescription>{t.latestStatus}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PermitTable permits={permits || []} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
