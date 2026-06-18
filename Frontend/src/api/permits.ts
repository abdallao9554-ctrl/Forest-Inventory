import api from './client';

export interface Permit {
    id: string
    permitNumber: string
    applicant: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
    issueDate: string
    expiryDate: string
    areaHa: number
    treeCount: number
    selectedTreeIds?: string[]
}

export const permitsApi = {
    getPermits: async (): Promise<Permit[]> => {
        const response = await api.get('/permits');
        return response.data;
    },
    getPermitById: async (id: string): Promise<Permit> => {
        const response = await api.get(`/permits/${id}`);
        return response.data;
    },
    createPermit: async (data: any): Promise<Permit> => {
        const response = await api.post('/permits', data);
        return response.data;
    },
    updatePermitStatus: async (id: string, status: 'APPROVED' | 'REJECTED' | 'EXPIRED', note?: string): Promise<void> => {
        await api.patch(`/permits/${id}/status`, { status, note });
    }
}
