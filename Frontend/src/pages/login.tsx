import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { Loader2, Trees } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth-store"
import { authApi } from "@/api/auth"

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "admin@forest.go.tz",
            password: "password123",
        },
    })

    const loginMutation = useMutation({
        mutationFn: async (data: LoginValues) => {
            return authApi.login(data.email, data.password)
        },
        onSuccess: (data) => {
            login(data.user, data.token)
            navigate("/dashboard")
        },
        onError: (err) => {
            setError(err instanceof Error ? err.message : "Login failed")
        },
    })

    const onSubmit = (data: LoginValues) => {
        setError(null)
        loginMutation.mutate(data)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-sm shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Trees className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                {...register("email")}
                                disabled={loginMutation.isPending}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <a
                                    href="#"
                                    className="text-xs font-medium text-primary hover:underline"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                disabled={loginMutation.isPending}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password.message}</p>
                            )}
                        </div>
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}
                        <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                            {loginMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
                    <div className="w-full border-t my-2" />
                    <p>Demo Credentials:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="bg-muted px-2 py-1 rounded">admin@forest.go.tz</span>
                        <span className="bg-muted px-2 py-1 rounded">password123</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
