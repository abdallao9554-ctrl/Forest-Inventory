export interface Inspection {
    id: string
    permitId: string
    permitNumber: string // Denormalized for easier display
    inspectorName: string
    inspectionDate: string
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW'
    location: { lat: number, lng: number }
    notes: string
    findings: string[]
}

const MOCK_INSPECTIONS: Inspection[] = [
    {
        id: 'INS-001',
        permitId: '1',
        permitNumber: 'P-2023-001',
        inspectorName: 'Jane Ranger',
        inspectionDate: '2023-11-15',
        status: 'COMPLIANT',
        location: { lat: -1.285, lng: 36.825 },
        notes: 'All felled trees match the permit specifications.',
        findings: ['Correct species harvested', 'Boundaries respected']
    },
    {
        id: 'INS-002',
        permitId: '2',
        permitNumber: 'P-2023-002',
        inspectorName: 'John Warden',
        inspectionDate: '2023-11-20',
        status: 'NON_COMPLIANT',
        location: { lat: -1.288, lng: 36.822 },
        notes: 'Found evidence of harvesting outside the designated plot.',
        findings: ['Harvesting outside boundary', 'Protected species damaged']
    }
]

export const inspectionApi = {
    getInspections: async (): Promise<Inspection[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_INSPECTIONS), 500))
    },
    getInspection: async (id: string): Promise<Inspection | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_INSPECTIONS.find(i => i.id === id)), 500))
    },
    createInspection: async (data: Omit<Inspection, 'id'>): Promise<void> => {
        const newInspection = {
            ...data,
            id: `INS-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        }
        MOCK_INSPECTIONS.unshift(newInspection)
        return new Promise(resolve => setTimeout(resolve, 1000))
    },
    updateInspection: async (id: string, data: Partial<Inspection>): Promise<void> => {
        console.log(`Updating inspection ${id} with:`, data)
        const index = MOCK_INSPECTIONS.findIndex(i => i.id === id)
        if (index !== -1) {
            MOCK_INSPECTIONS[index] = { ...MOCK_INSPECTIONS[index], ...data }
        }
        return new Promise(resolve => setTimeout(resolve, 800))
    }
}
