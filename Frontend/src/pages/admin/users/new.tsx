import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Loader2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usersApi } from '@/api/users'
import type { UserRole, UserStatus } from '@/api/users'

export default function NewUserPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER' as UserRole,
        status: 'ACTIVE' as UserStatus
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        try {
            await usersApi.createUser({
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status
            })
            await queryClient.invalidateQueries({ queryKey: ['users'] })
            navigate('/admin/users')
        } catch (error) {
            console.error('Failed to create user', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="flex flex-col h-full space-y-6 p-8 w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Add New User</h2>
                    <p className="text-muted-foreground">
                        Create a new system user and assign their role.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>Enter the basic information for the new user.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Juma Kapuya"
                                    required
                                    className="bg-muted/30 border-primary/10 accent-primary"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="juma@forest.go.tz"
                                    required
                                    className="bg-muted/30 border-primary/10 accent-primary"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Role</Label>
                                <select
                                    id="role"
                                    name="role"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-primary/10 bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="USER">Standard User</option>
                                    <option value="INSPECTOR">Field Inspector</option>
                                    <option value="MANAGER">District Manager</option>
                                    <option value="ADMIN">System Administrator</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-primary/10 bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="ACTIVE text-green-600">Active</option>
                                    <option value="PENDING text-amber-600 font-bold">Pending Approval</option>
                                    <option value="INACTIVE text-red-600">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-dashed">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <Shield className="h-3 w-3" /> Security Credentials
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Temporary Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="bg-muted/30 border-primary/10"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className={cn(
                                            "bg-muted/30 border-primary/10",
                                            formData.confirmPassword && formData.password !== formData.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                        <p className="text-[10px] text-red-500 font-bold">Passwords do not match</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')} className="uppercase text-[10px] font-bold tracking-widest px-8">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || (!!formData.confirmPassword && formData.password !== formData.confirmPassword)}
                                className="uppercase text-[10px] font-bold tracking-widest px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-3 w-3" />
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
