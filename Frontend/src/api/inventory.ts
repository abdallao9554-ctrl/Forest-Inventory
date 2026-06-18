import api from './client';

export interface Compartment {
    id: string
    name: string
    forestName: string
    areaHa: number
    protectionStatus: 'PROTECTED' | 'COMMERCIAL' | 'BUFFER_ZONE'
    dominantSpecies: string
    geoJson: any // Polygon
}

export interface Plot {
    id: string
    compartmentId: string
    plotNumber: string
    surveyDate: string
    radius: number
    geoJson: any // Point
}

export interface Tree {
    id: string
    plotId: string
    speciesCode: string
    dbh: number
    height: number
    volume: number
    status: 'ALIVE' | 'DEAD' | 'HARVESTED'
    geoJson: any // Point
}

const parseGeoJson = (item: any) => {
    if (item.geoJson && typeof item.geoJson === 'string') {
        try {
            item.geoJson = JSON.parse(item.geoJson);
        } catch (e) {
            console.error('Failed to parse geoJson', e);
        }
    }
    return item;
};

export const inventoryApi = {
    getCompartments: async (): Promise<Compartment[]> => {
        const response = await api.get('/inventory/compartments');
        return response.data.map(parseGeoJson);
    },
    getPlots: async (compartmentId?: string): Promise<Plot[]> => {
        const response = await api.get('/inventory/plots', {
            params: { compartmentId }
        });
        return response.data.map(parseGeoJson);
    },
    getTrees: async (plotId?: string): Promise<Tree[]> => {
        const response = await api.get('/inventory/trees', {
            params: { plotId }
        });
        return response.data.map(parseGeoJson);
    },
    getTreesByIds: async (treeIds: string[]): Promise<Tree[]> => {
        // For now, if there's no specific bulk endpoint, we might need one or filter locally
        // But let's assume we can pass treeIds as a param
        const response = await api.get('/inventory/trees', {
            params: { ids: treeIds.join(',') }
        });
        return response.data.map(parseGeoJson);
    }
}
