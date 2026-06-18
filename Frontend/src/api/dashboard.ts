export interface KpiData {
    activePermits: number
    approvedVolume: number
    harvestedVolume: number
    treesApproved: number
    treesVerified: number
}

export interface ChartData {
    name: string
    value: number
}

export interface PermitSummary {
    id: string
    permitNumber: string
    applicant: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
    issueDate: string
    expiryDate: string
}

const MOCK_KPIS: KpiData = {
    activePermits: 124,
    approvedVolume: 45000,
    harvestedVolume: 12500,
    treesApproved: 15000,
    treesVerified: 4200,
}

const MOCK_MONTHLY_TREND = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 550 },
    { name: 'Apr', value: 450 },
    { name: 'May', value: 600 },
    { name: 'Jun', value: 700 },
]

const MOCK_SPECIES_DIST = [
    { name: 'Pine', value: 45 },
    { name: 'Oak', value: 25 },
    { name: 'Eucalyptus', value: 20 },
    { name: 'Teak', value: 10 },
]

const MOCK_FOREST_DIST = [
    { name: 'North Forest', value: 2100 },
    { name: 'East Reserve', value: 1400 },
    { name: 'West Valley', value: 700 },
]

// Mock hotspot data representing tree cutting locations
// Separated into permits and inventory for filtering

// PERMIT LOCATIONS - Concentrated in North and East zones
const MOCK_PERMIT_HOTSPOTS = [
    // High concentration - North zone (Permit applications)
    { lat: -1.25, lng: 36.80, intensity: 0.9 },
    { lat: -1.26, lng: 36.81, intensity: 0.8 },
    { lat: -1.24, lng: 36.82, intensity: 0.85 },
    { lat: -1.27, lng: 36.79, intensity: 0.75 },
    { lat: -1.23, lng: 36.83, intensity: 0.7 },
    { lat: -1.25, lng: 36.78, intensity: 0.65 },

    // Medium concentration - East zone (Permit applications)
    { lat: -1.30, lng: 36.90, intensity: 0.7 },
    { lat: -1.31, lng: 36.91, intensity: 0.65 },
    { lat: -1.29, lng: 36.89, intensity: 0.6 },
    { lat: -1.32, lng: 36.92, intensity: 0.55 },

    // Scattered permit points
    { lat: -1.20, lng: 36.85, intensity: 0.5 },
    { lat: -1.28, lng: 36.94, intensity: 0.45 },
    { lat: -1.22, lng: 36.77, intensity: 0.4 },
]

// INVENTORY LOCATIONS - Concentrated in East and South zones
const MOCK_INVENTORY_HOTSPOTS = [
    // High concentration - East zone (Inventory harvesting)
    { lat: -1.30, lng: 36.88, intensity: 0.95 },
    { lat: -1.31, lng: 36.89, intensity: 0.9 },
    { lat: -1.29, lng: 36.87, intensity: 0.85 },
    { lat: -1.32, lng: 36.90, intensity: 0.8 },
    { lat: -1.28, lng: 36.86, intensity: 0.75 },

    // High concentration - South zone (Inventory harvesting)
    { lat: -1.35, lng: 36.85, intensity: 0.85 },
    { lat: -1.36, lng: 36.86, intensity: 0.8 },
    { lat: -1.34, lng: 36.84, intensity: 0.75 },
    { lat: -1.37, lng: 36.85, intensity: 0.7 },

    // Medium concentration - West zone
    { lat: -1.28, lng: 36.70, intensity: 0.6 },
    { lat: -1.27, lng: 36.71, intensity: 0.65 },
    { lat: -1.29, lng: 36.69, intensity: 0.55 },

    // Scattered inventory points
    { lat: -1.21, lng: 36.95, intensity: 0.5 },
    { lat: -1.38, lng: 36.82, intensity: 0.45 },
    { lat: -1.19, lng: 36.87, intensity: 0.4 },
]

// Combined dataset
const MOCK_COMBINED_HOTSPOTS = [
    ...MOCK_PERMIT_HOTSPOTS,
    ...MOCK_INVENTORY_HOTSPOTS
]

const MOCK_PERMITS: PermitSummary[] = [
    { id: '1', permitNumber: 'P-2023-001', applicant: 'Green Timber Co.', status: 'APPROVED', issueDate: '2023-10-01', expiryDate: '2023-12-31' },
    { id: '2', permitNumber: 'P-2023-002', applicant: 'EcoWoods Ltd.', status: 'PENDING', issueDate: '2023-11-05', expiryDate: '2024-02-05' },
    { id: '3', permitNumber: 'P-2023-003', applicant: 'Sustainable Logs', status: 'APPROVED', issueDate: '2023-09-15', expiryDate: '2023-12-15' },
    { id: '4', permitNumber: 'P-2023-004', applicant: 'Forestry Inc.', status: 'EXPIRED', issueDate: '2023-01-01', expiryDate: '2023-06-01' },
    { id: '5', permitNumber: 'P-2023-005', applicant: 'John Doe', status: 'REJECTED', issueDate: '2023-11-01', expiryDate: '2023-11-01' },
]

// Mock permit locations with coordinates for markers
const MOCK_PERMIT_LOCATIONS = [
    {
        id: '1',
        permitNumber: 'P-2023-001',
        applicant: 'Green Timber Co.',
        status: 'APPROVED' as const,
        issueDate: '2023-10-01',
        expiryDate: '2023-12-31',
        areaHa: 15.5,
        treeCount: 150,
        lat: -1.25,
        lng: 36.80
    },
    {
        id: '2',
        permitNumber: 'P-2023-002',
        applicant: 'EcoWoods Ltd.',
        status: 'PENDING' as const,
        issueDate: '2023-11-05',
        expiryDate: '2024-02-05',
        areaHa: 8.2,
        treeCount: 80,
        lat: -1.30,
        lng: 36.90
    },
    {
        id: '3',
        permitNumber: 'P-2023-003',
        applicant: 'Sustainable Logs',
        status: 'APPROVED' as const,
        issueDate: '2023-09-15',
        expiryDate: '2023-12-15',
        areaHa: 22.0,
        treeCount: 210,
        lat: -1.28,
        lng: 36.70
    },
    {
        id: '4',
        permitNumber: 'P-2023-004',
        applicant: 'Forestry Inc.',
        status: 'EXPIRED' as const,
        issueDate: '2023-01-01',
        expiryDate: '2023-06-01',
        areaHa: 12.0,
        treeCount: 100,
        lat: -1.35,
        lng: 36.85
    },
    {
        id: '5',
        permitNumber: 'P-2023-005',
        applicant: 'John Doe',
        status: 'REJECTED' as const,
        issueDate: '2023-11-01',
        expiryDate: '2023-11-01',
        areaHa: 0.5,
        treeCount: 5,
        lat: -1.22,
        lng: 36.88
    },
    {
        id: '6',
        permitNumber: 'P-2023-006',
        applicant: 'Forest Products Ltd.',
        status: 'APPROVED' as const,
        issueDate: '2023-08-20',
        expiryDate: '2023-11-20',
        areaHa: 18.3,
        treeCount: 175,
        lat: -1.26,
        lng: 36.81
    },
    {
        id: '7',
        permitNumber: 'P-2023-007',
        applicant: 'Eco Harvesters',
        status: 'APPROVED' as const,
        issueDate: '2023-09-10',
        expiryDate: '2024-01-10',
        areaHa: 10.0,
        treeCount: 95,
        lat: -1.31,
        lng: 36.91
    }
]

export const dashboardApi = {
    getKpis: async (): Promise<KpiData> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_KPIS), 600))
    },
    getCharts: async (): Promise<{ monthly: ChartData[]; species: ChartData[]; forest: ChartData[] }> => {
        return new Promise(resolve => setTimeout(() => resolve({
            monthly: MOCK_MONTHLY_TREND,
            species: MOCK_SPECIES_DIST,
            forest: MOCK_FOREST_DIST
        }), 800))
    },
    getRecentPermits: async (): Promise<PermitSummary[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_PERMITS), 500))
    },
    getHotspotData: async (): Promise<{
        permits: Array<{ lat: number; lng: number; intensity: number }>;
        inventory: Array<{ lat: number; lng: number; intensity: number }>;
        combined: Array<{ lat: number; lng: number; intensity: number }>;
    }> => {
        return new Promise(resolve => setTimeout(() => resolve({
            permits: MOCK_PERMIT_HOTSPOTS,
            inventory: MOCK_INVENTORY_HOTSPOTS,
            combined: MOCK_COMBINED_HOTSPOTS
        }), 700))
    },
    getPermitLocations: async (): Promise<typeof MOCK_PERMIT_LOCATIONS> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_PERMIT_LOCATIONS), 600))
    }
}

