import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreHorizontal, Shield, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usersApi } from '@/api/users'
import type { UserRole, UserStatus } from '@/api/users'

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<{ id: string, name: string, role: UserRole, status: UserStatus } | null>(null)
    const queryClient = useQueryClient()

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getUsers
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: UserStatus }) =>
            usersApi.updateUser(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        }
    })

    const updateUserMutation = useMutation({
        mutationFn: ({ id, role, status }: { id: string, role: UserRole, status: UserStatus }) =>
            usersApi.updateUser(id, { role, status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setIsUpdateDialogOpen(false)
            setSelectedUser(null)
        }
    })

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => usersApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        }
    })

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200'
            case 'INACTIVE': return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-gray-200'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'ADMIN': return <Shield className="h-4 w-4 mr-2 text-red-600" />
            case 'MANAGER': return <Shield className="h-4 w-4 mr-2 text-blue-600" />
            case 'INSPECTOR': return <UserIcon className="h-4 w-4 mr-2 text-green-600" />
            default: return <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
        }
    }

    const filteredUsers = users?.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenUpdateDialog = (user: { id: string, name: string, role: UserRole, status: UserStatus }) => {
        setSelectedUser(user)
        setIsUpdateDialogOpen(true)
    }

    return (
        <div className="flex flex-col h-full space-y-6 p-8 w-full relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">
                        Manage system access, roles, and user statuses.
                    </p>
                </div>
                <Button className="shadow-sm" asChild>
                    <Link to="/admin/users/new">
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Link>
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>System Users</CardTitle>
                            <CardDescription>A list of all registered users in the system.</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 font-bold uppercase text-[10px] tracking-widest">
                                    <TableHead className="w-[280px]">User Profile</TableHead>
                                    <TableHead>System Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm font-medium text-muted-foreground">Fetching users...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No users found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers?.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors border-b last:border-0">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border-2 border-primary/20">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <div className={cn(
                                                        "p-1.5 rounded-md mr-2",
                                                        user.role === 'ADMIN' ? "bg-red-50" :
                                                            user.role === 'MANAGER' ? "bg-blue-50" : "bg-green-50"
                                                    )}>
                                                        {getRoleIcon(user.role)}
                                                    </div>
                                                    <span className="text-sm font-semibold capitalize">{user.role.toLowerCase()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() => {
                                                        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                                        updateStatusMutation.mutate({ id: user.id, status: newStatus })
                                                    }}
                                                    className="focus:outline-none"
                                                >
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "px-3 py-1 text-[10px] font-bold tracking-tighter transition-all hover:scale-105 active:scale-95",
                                                            getStatusColor(user.status)
                                                        )}
                                                    >
                                                        {user.status === 'ACTIVE' && <div className="h-1 w-1 rounded-full bg-current mr-1.5 animate-pulse" />}
                                                        {user.status}
                                                    </Badge>
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs font-medium">
                                                <div className="flex flex-col">
                                                    <span>{user.lastActive === '-' ? 'Never' : new Date(user.lastActive).toLocaleDateString()}</span>
                                                    <span className="text-[10px] opacity-70">
                                                        {user.lastActive !== '-' && new Date(user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleOpenUpdateDialog(user)}>
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                                                                    deleteUserMutation.mutate(user.id)
                                                                }
                                                            }}
                                                        >
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Role & Status Selection Dialog */}
            {isUpdateDialogOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle>Edit User: {selectedUser.name}</CardTitle>
                            <CardDescription>
                                Update role and system access status.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Role</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {(['ADMIN', 'MANAGER', 'INSPECTOR', 'USER'] as UserRole[]).map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => setSelectedUser({ ...selectedUser, role })}
                                            className={cn(
                                                "flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left",
                                                selectedUser.role === role
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-border hover:bg-muted/50"
                                            )}
                                        >
                                            <div className="flex items-center">
                                                {getRoleIcon(role)}
                                                <span className="font-medium capitalize">{role.toLowerCase()}</span>
                                            </div>
                                            {selectedUser.role === role && (
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account Status</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(['ACTIVE', 'INACTIVE', 'PENDING'] as UserStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedUser({ ...selectedUser, status })}
                                            className={cn(
                                                "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                                                selectedUser.status === status
                                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                                    : "bg-background border-input hover:bg-muted"
                                            )}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex items-center justify-end p-6 border-t gap-3">
                            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => updateUserMutation.mutate({
                                    id: selectedUser.id,
                                    role: selectedUser.role,
                                    status: selectedUser.status
                                })}
                                disabled={updateUserMutation.isPending}
                            >
                                {updateUserMutation.isPending ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}


