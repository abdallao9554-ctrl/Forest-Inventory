import api from './client';
import type { User } from "@/store/auth-store"

export interface LoginResponse {
    user: User
    token: string
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
}
