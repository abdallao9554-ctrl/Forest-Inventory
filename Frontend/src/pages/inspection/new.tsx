import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { permitsApi } from "@/api/permits"
import { inspectionApi } from "@/api/inspection"

export default function NewInspectionPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        permitId: '',
        inspectorName: '',
        status: 'COMPLIANT' as 'COMPLIANT' | 'NON_COMPLIANT',
        notes: '',
        findings: ''
    })

    // Fetch Approved Permits to inspect
    const { data: permits = [] } = useQuery({
        queryKey: ['permits'],
        queryFn: permitsApi.getPermits
    })

    // Filter only Approved or Expired permits (logic: can inspect expired ones too?)
    // Sticking to APPROVED for now as per plan
    const approvedPermits = permits.filter(p => p.status === 'APPROVED')

    const handleSubmit = async () => {
        const selectedPermit = permits.find(p => p.id === formData.permitId)

        await inspectionApi.createInspection({
            permitId: formData.permitId,
            permitNumber: selectedPermit?.permitNumber || 'UNKNOWN',
            inspectorName: formData.inspectorName,
            inspectionDate: new Date().toISOString().split('T')[0],
            status: formData.status,
            location: { lat: -1.2921, lng: 36.8219 }, // Mock current location
            notes: formData.notes,
            findings: formData.findings.split('\n').filter(f => f.trim().length > 0)
        })
        navigate('/inspection')
    }

    return (
        <div className="flex flex-col space-y-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/inspection')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Inspection</h1>
                    <p className="text-muted-foreground">Record findings for a permit field inspection.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle>Inspection Details</CardTitle>
                    <CardDescription>Fill in the details of the field visit and physical verification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="permit-select" className="text-xs font-bold uppercase text-muted-foreground">Select Permit to Inspect</Label>
                            <select
                                id="permit-select"
                                className="flex h-10 w-full rounded-md border border-primary/10 bg-muted/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={formData.permitId}
                                onChange={(e) => setFormData({ ...formData, permitId: e.target.value })}
                            >
                                <option value="" disabled>Search approved permits...</option>
                                {approvedPermits.length === 0 ? (
                                    <option disabled>No active permits found</option>
                                ) : (
                                    approvedPermits.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.permitNumber} - {p.applicant}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="inspector" className="text-xs font-bold uppercase text-muted-foreground">Inspector Name</Label>
                            <Input
                                id="inspector"
                                placeholder="FullName / Rank"
                                className="bg-muted/20"
                                value={formData.inspectorName}
                                onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Compliance Outcome</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'COMPLIANT', label: 'Compliant', color: 'text-green-600', desc: 'Activities match permit specifications.' },
                                { id: 'NON_COMPLIANT', label: 'Non-Compliant', color: 'text-red-600', desc: 'Violations or discrepancies observed.' },
                                { id: 'NEEDS_REVIEW', label: 'Needs Review', color: 'text-amber-600', desc: 'Follow-up or senior input required.' }
                            ].map((opt) => (
                                <label
                                    key={opt.id}
                                    className={`flex items-start space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${formData.status === opt.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                            : 'border-border hover:bg-muted/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === opt.id}
                                        onChange={() => setFormData({ ...formData, status: opt.id as any })}
                                        className="mt-1 h-4 w-4 text-primary focus:ring-primary"
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
                        <Label htmlFor="findings" className="text-xs font-bold uppercase text-muted-foreground">Detailed Findings</Label>
                        <textarea
                            id="findings"
                            placeholder="- Tree species verified&#10;- Boundaries within limits"
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={formData.findings}
                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground font-medium italic">* Enter each point on a separate line</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-bold uppercase text-muted-foreground">Additional Professional Notes</Label>
                        <textarea
                            id="notes"
                            placeholder="Professional summary or recommendations..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-3 border-t bg-muted/5 p-6 rounded-b-lg">
                    <Button variant="outline" className="px-8 uppercase text-[10px] font-bold tracking-widest" onClick={() => navigate('/inspection')}>Discard</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.permitId || !formData.inspectorName}
                        className="px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 uppercase text-[10px] font-bold tracking-widest"
                    >
                        <Save className="mr-2 h-3 w-3" />
                        Submit Report
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
