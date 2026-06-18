import type { User } from "@/store/auth-store"

export const MOCK_USERS: User[] = [
    {
        id: "1",
        name: "Admin User",
        email: "admin@forest.gov",
        role: "ADMIN",
        avatarUrl: "https://github.com/shadcn.png"
    },
    {
        id: "2",
        name: "Forest Officer",
        email: "officer@forest.gov",
        role: "OFFICER",
    },
    {
        id: "3",
        name: "Inspector Gadget",
        email: "inspector@forest.gov",
        role: "INSPECTOR",
    },
    {
        id: "4",
        name: "Public Viewer",
        email: "viewer@public.com",
        role: "VIEWER",
    },
]
