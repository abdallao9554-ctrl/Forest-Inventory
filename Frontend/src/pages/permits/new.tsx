import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Check, ClipboardList, Map as MapIcon, Trees, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapView } from "@/components/map/map-view"
import { DrawingMapLayer } from "@/components/map/drawing-map-layer"
import { permitsApi } from "@/api/permits"
import { cn } from "@/lib/utils"
import { inventoryApi } from "@/api/inventory"

// Wizard Steps
const STEPS = [
    { id: 'details', title: 'Details', icon: ClipboardList },
    { id: 'area', title: 'Permit Area', icon: MapIcon },
    { id: 'trees', title: 'Select Trees', icon: Trees },
    { id: 'review', title: 'Review', icon: CheckCircle2 },
]

export default function NewPermitPage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)

    // State for wizard data
    const [permitDetails, setPermitDetails] = useState({
        applicant: '',
        purpose: '',
    })
    const [areaPoints, setAreaPoints] = useState<[number, number][]>([])
    const [selectedTreeIds, setSelectedTreeIds] = useState<string[]>([])



    // Fetch Inventory
    const { data: inventoryTrees = [], isLoading } = useQuery({
        queryKey: ['inventory', 'trees'],
        queryFn: () => inventoryApi.getTrees()
    })

    // Derived data
    const selectedTrees = inventoryTrees.filter(t => selectedTreeIds.includes(t.id))
    const totalTrees = selectedTrees.length
    const estimatedVolume = selectedTrees.reduce((sum, t) => sum + (t.volume || 0), 0).toFixed(2)

    // Mock submission
    const handleSubmit = async () => {
        // Here we would construct the full payload including areaPoints and selectedTreeIds
        await permitsApi.createPermit({
            ...permitDetails,
            areaPoints,
            selectedTrees: selectedTreeIds
        })
        navigate('/permits')
    }

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

    return (
        <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">New Permit Application</h1>
                <p className="text-muted-foreground">Follow the steps to create a new felling permit.</p>
            </div>

            {/* Stepper */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10" />
                <div className="flex justify-between">
                    {STEPS.map((step, index) => {
                        const isActive = index === currentStep
                        const isCompleted = index < currentStep

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                    isActive ? "border-primary bg-primary text-primary-foreground" :
                                        isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                            "border-muted-foreground text-muted-foreground bg-background"
                                )}>
                                    {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}>{step.title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>{STEPS[currentStep].title}</CardTitle>
                    <CardDescription>
                        {currentStep === 0 && "Enter applicant and permit details."}
                        {currentStep === 1 && "Draw the permit area on the map."}
                        {currentStep === 2 && "Identify trees marked for felling."}
                        {currentStep === 3 && "Review and submit application."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    {currentStep === 0 && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="applicant">Applicant Name</Label>
                                    <Input
                                        id="applicant"
                                        value={permitDetails.applicant}
                                        onChange={(e) => setPermitDetails({ ...permitDetails, applicant: e.target.value })}
                                        placeholder="Company or Individual Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purpose">Purpose</Label>
                                    <Input
                                        id="purpose"
                                        value={permitDetails.purpose}
                                        onChange={(e) => setPermitDetails({ ...permitDetails, purpose: e.target.value })}
                                        placeholder="e.g. Commercial Harvesting"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="h-[400px] w-full bg-muted rounded-md relative overflow-hidden border">
                            <div className="absolute top-4 left-14 z-[400] bg-background/90 p-2 rounded shadow text-xs">
                                <p><strong>Instructions:</strong> Click on the map to define the boundary points.</p>
                                <p>Current Points: {areaPoints.length}</p>
                            </div>
                            <MapView>
                                <DrawingMapLayer points={areaPoints} onChange={setAreaPoints} />
                            </MapView>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">Select trees from the available inventory below.</p>
                            </div>

                            <div className="border rounded-md overflow-hidden">
                                <div className="grid grid-cols-5 gap-4 p-3 font-medium bg-muted text-sm">
                                    <div className="col-span-1">Select</div>
                                    <div className="col-span-1">Species</div>
                                    <div className="col-span-1">DBH (cm)</div>
                                    <div className="col-span-1">Height (m)</div>
                                    <div className="col-span-1">Quality</div>
                                </div>
                                <div className="divide-y max-h-[300px] overflow-auto">
                                    {isLoading ? (
                                        <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
                                    ) : (
                                        inventoryTrees.map((tree) => (
                                            <div key={tree.id} className="grid grid-cols-5 gap-4 p-3 items-center hover:bg-muted/50 text-sm">
                                                <div className="col-span-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTreeIds.includes(tree.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedTreeIds([...selectedTreeIds, tree.id])
                                                            } else {
                                                                setSelectedTreeIds(selectedTreeIds.filter(id => id !== tree.id))
                                                            }
                                                        }}
                                                        className="h-4 w-4"
                                                    />
                                                </div>
                                                <div className="col-span-1">{tree.speciesCode}</div>
                                                <div className="col-span-1">{tree.dbh}</div>
                                                <div className="col-span-1">{tree.height}</div>
                                                <div className="col-span-1">
                                                    <Badge variant="outline">{tree.status}</Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <p className="text-sm font-medium">Selected: {selectedTreeIds.length} trees</p>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                                <h3 className="font-semibold">Summary</h3>
                                <div className="grid grid-cols-2 text-sm gap-2">
                                    <span className="text-muted-foreground">Applicant:</span>
                                    <span>{permitDetails.applicant || '-'}</span>
                                    <span className="text-muted-foreground">Purpose:</span>
                                    <span>{permitDetails.purpose || '-'}</span>
                                    <span className="text-muted-foreground">Area Points:</span>
                                    <span>{areaPoints.length} points defined</span>
                                    <span className="text-muted-foreground">Trees Selected:</span>
                                    <span>{totalTrees} trees (~{estimatedVolume} m³)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 border rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm">
                                <ClipboardList className="h-4 w-4" />
                                <p>Pending approval from District Forest Officer.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/10 p-6">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                        Previous
                    </Button>
                    {currentStep === STEPS.length - 1 ? (
                        <Button onClick={handleSubmit}>Submit Application</Button>
                    ) : (
                        <Button onClick={nextStep}>Next Step</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
