

export type UserRole = 'ADMIN' | 'MANAGER' | 'INSPECTOR' | 'USER'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING'

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    status: UserStatus
    lastActive: string
    joinedDate: string
}

const MOCK_USERS: User[] = [
    {
        id: 'USR-001',
        name: 'Juma Kapuya',
        email: 'juma.kapuya@forest.go.tz',
        role: 'ADMIN',
        status: 'ACTIVE',
        lastActive: '2025-05-20T10:30:00Z',
        joinedDate: '2024-01-15'
    },
    {
        id: 'USR-002',
        name: 'Sarah Mtei',
        email: 'sarah.mtei@forest.go.tz',
        role: 'MANAGER',
        status: 'ACTIVE',
        lastActive: '2025-05-19T16:45:00Z',
        joinedDate: '2024-02-01'
    },
    {
        id: 'USR-003',
        name: 'Godfrey Mushi',
        email: 'g.mushi@forest.go.tz',
        role: 'INSPECTOR',
        status: 'ACTIVE',
        lastActive: '2025-05-20T08:15:00Z',
        joinedDate: '2024-03-10'
    },
    {
        id: 'USR-004',
        name: 'Aisha Bakari',
        email: 'aisha.b@forest.go.tz',
        role: 'USER',
        status: 'ACTIVE',
        lastActive: '2025-04-10T09:00:00Z',
        joinedDate: '2024-03-15'
    },
    {
        id: 'USR-005',
        name: 'New Inspector',
        email: 'inspector.new@forest.go.tz',
        role: 'INSPECTOR',
        status: 'PENDING',
        lastActive: '-',
        joinedDate: '2025-05-18'
    }
]

export const usersApi = {
    getUsers: async (): Promise<User[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve([...MOCK_USERS]), 600)
        })
    },

    getUser: async (id: string): Promise<User | undefined> => {
        return new Promise(resolve => {
            setTimeout(() => resolve(MOCK_USERS.find(u => u.id === id)), 400)
        })
    },

    createUser: async (data: Omit<User, 'id' | 'joinedDate' | 'lastActive'>): Promise<void> => {
        const newUser: User = {
            ...data,
            id: `USR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            joinedDate: new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString()
        }
        MOCK_USERS.unshift(newUser)
        return new Promise(resolve => setTimeout(resolve, 800))
    },

    updateUser: async (id: string, data: Partial<User>): Promise<void> => {
        const index = MOCK_USERS.findIndex(u => u.id === id)
        if (index !== -1) {
            MOCK_USERS[index] = { ...MOCK_USERS[index], ...data }
        }
        return new Promise(resolve => setTimeout(resolve, 800))
    },

    deleteUser: async (id: string): Promise<void> => {
        const index = MOCK_USERS.findIndex(u => u.id === id)
        if (index !== -1) {
            MOCK_USERS.splice(index, 1)
        }
        return new Promise(resolve => setTimeout(resolve, 800))
    }
}
