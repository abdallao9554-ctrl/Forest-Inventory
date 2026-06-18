import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inspectionApi } from "@/api/inspection"
import type { Inspection } from "@/api/inspection"

export default function EditInspectionPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        inspectorName: '',
        status: 'COMPLIANT' as 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW',
        notes: '',
        findings: ''
    })

    const { data: inspection, isLoading: isLoadingData } = useQuery({
        queryKey: ['inspection', id],
        queryFn: () => inspectionApi.getInspection(id as string),
        enabled: !!id
    })

    useEffect(() => {
        if (inspection) {
            setFormData({
                inspectorName: inspection.inspectorName,
                status: inspection.status,
                notes: inspection.notes,
                findings: inspection.findings.join('\n')
            })
        }
    }, [inspection])

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Inspection>) => inspectionApi.updateInspection(id as string, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inspections'] })
            queryClient.invalidateQueries({ queryKey: ['inspection', id] })
            navigate(`/inspection/${id}`)
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({
            inspectorName: formData.inspectorName,
            status: formData.status,
            notes: formData.notes,
            findings: formData.findings.split('\n').filter(f => f.trim().length > 0)
        })
    }

    if (isLoadingData) {
        return (
            <div className="flex h-full items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!inspection) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="flex justify-center">
                    <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
                </div>
                <h2 className="text-2xl font-bold">Inspection Not Found</h2>
                <Button onClick={() => navigate('/inspection')}>Return to List</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6 max-w-2xl mx-auto w-full p-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/inspection/${id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Inspection</h1>
                    <p className="text-muted-foreground">Modify record {inspection.id} for {inspection.permitNumber}</p>
                </div>
            </div>

            <Card className="shadow-lg border-primary/10">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle>Update Findings</CardTitle>
                    <CardDescription>Correct or add new observations from the field visit.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="inspector" className="text-xs font-bold uppercase text-muted-foreground">Inspector Name</Label>
                            <Input
                                id="inspector"
                                className="bg-muted/20"
                                value={formData.inspectorName}
                                onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Compliance Outcome</Label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'COMPLIANT', label: 'Compliant', color: 'text-green-600', desc: 'No violations found.' },
                                    { id: 'NON_COMPLIANT', label: 'Non-Compliant', color: 'text-red-600', desc: 'Active violations observed.' },
                                    { id: 'NEEDS_REVIEW', label: 'Needs Review', color: 'text-amber-600', desc: 'Borderline case, requires senior audit.' }
                                ].map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-start space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${formData.status === opt.id
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-border hover:bg-muted/50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={opt.id}
                                            checked={formData.status === opt.id}
                                            onChange={() => setFormData({ ...formData, status: opt.id as any })}
                                            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-muted"
                                        />
                                        <div className="flex-1">
                                            <div className={`font-bold ${opt.color}`}>{opt.label}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="findings" className="text-xs font-bold uppercase text-muted-foreground">Point-by-Point Findings</Label>
                            <textarea
                                id="findings"
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.findings}
                                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                placeholder="Enter each finding on a new line..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-xs font-bold uppercase text-muted-foreground">Professional Summary (Notes)</Label>
                            <textarea
                                id="notes"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 p-6">
                        <Button variant="outline" type="button" onClick={() => navigate(`/inspection/${id}`)}>Cancel</Button>
                        <Button type="submit" disabled={updateMutation.isPending} className="px-8 bg-primary">
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Record
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
