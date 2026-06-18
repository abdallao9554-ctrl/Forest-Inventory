
export interface ReportSummary {
    totalRevenue: number
    revenueTrend: string
    activePermits: number
    expiringPermits: number
    complianceRate: number
    complianceTrend: string
}

export interface TrendData {
    name: string
    approved: number
    rejected: number
    expired: number
}

export interface SpeciesVolume {
    name: string
    volume: number
}

export interface SpatialHotspot {
    lat: number
    lng: number
    intensity: number
}

const MOCK_REPORTS = {
    weekly: {
        summary: {
            totalRevenue: 12500000,
            revenueTrend: "+5.2%",
            activePermits: 18,
            expiringPermits: 4,
            complianceRate: 88.5,
            complianceTrend: "+1.2%"
        },
        trends: [
            { name: 'Mon', approved: 2, rejected: 0, expired: 0 },
            { name: 'Tue', approved: 1, rejected: 0, expired: 1 },
            { name: 'Wed', approved: 3, rejected: 1, expired: 0 },
            { name: 'Thu', approved: 2, rejected: 0, expired: 0 },
            { name: 'Fri', approved: 4, rejected: 1, expired: 2 },
            { name: 'Sat', approved: 1, rejected: 0, expired: 0 },
            { name: 'Sun', approved: 0, rejected: 0, expired: 0 }
        ]
    },
    monthly: {
        summary: {
            totalRevenue: 45200000,
            revenueTrend: "+20.1%",
            activePermits: 24,
            expiringPermits: 15,
            complianceRate: 85.4,
            complianceTrend: "-2.1%"
        },
        trends: [
            { name: 'Jan', approved: 4, rejected: 1, expired: 2 },
            { name: 'Feb', approved: 6, rejected: 0, expired: 1 },
            { name: 'Mar', approved: 8, rejected: 2, expired: 3 },
            { name: 'Apr', approved: 12, rejected: 1, expired: 4 },
            { name: 'May', approved: 9, rejected: 3, expired: 2 },
            { name: 'Jun', approved: 15, rejected: 2, expired: 5 },
            { name: 'Jul', approved: 18, rejected: 4, expired: 6 }
        ]
    },
    annual: {
        summary: {
            totalRevenue: 540000000,
            revenueTrend: "+12.5%",
            activePermits: 120,
            expiringPermits: 45,
            complianceRate: 82.1,
            complianceTrend: "+0.5%"
        },
        trends: [
            { name: '2021', approved: 45, rejected: 12, expired: 30 },
            { name: '2022', approved: 68, rejected: 15, expired: 45 },
            { name: '2023', approved: 92, rejected: 18, expired: 50 },
            { name: '2024', approved: 110, rejected: 22, expired: 65 },
            { name: '2025', approved: 145, rejected: 25, expired: 80 }
        ]
    }
}

export const reportsApi = {
    getSummary: async (timeframe: 'weekly' | 'monthly' | 'annual'): Promise<ReportSummary> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_REPORTS[timeframe].summary), 600))
    },
    getTrends: async (timeframe: 'weekly' | 'monthly' | 'annual'): Promise<TrendData[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_REPORTS[timeframe].trends), 800))
    },
    getSpeciesVolume: async (): Promise<SpeciesVolume[]> => {
        return new Promise(resolve => setTimeout(() => resolve([
            { name: 'Pine', volume: 450 },
            { name: 'Cypress', volume: 320 },
            { name: 'Eucalyptus', volume: 210 },
            { name: 'Mahogany', volume: 80 },
            { name: 'Teak', volume: 150 }
        ]), 700))
    },
    getSpatialData: async (): Promise<SpatialHotspot[]> => {
        return new Promise(resolve => setTimeout(() => resolve([
            { lat: -1.2921, lng: 36.8219, intensity: 0.8 },
            { lat: -1.2851, lng: 36.8119, intensity: 0.6 },
            { lat: -1.3021, lng: 36.8319, intensity: 0.9 },
            { lat: -1.2721, lng: 36.8019, intensity: 0.5 },
            { lat: -1.2921, lng: 36.8519, intensity: 0.7 },
            { lat: -1.3121, lng: 36.8419, intensity: 0.4 },
            { lat: -1.2921, lng: 36.8319, intensity: 1.0 }
        ]), 900))
    }
}
