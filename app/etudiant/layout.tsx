"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Bell,
    FileText,
    LogOut,
    Plus,
    User,
    Menu,
    Home
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Notification {
    id: number
    message: string
    created_at: string
    lu: boolean
    type: "info" | "warning" | "success" | "error"
}

export default function EtudiantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()
    const [user, setUser] = useState<any>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const userData = localStorage.getItem("user")

        if (!token || !userData) {
            router.push("/auth/login")
            return
        }

        setUser(JSON.parse(userData))
        setLoading(false)
    }, [])

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            fetchNotifications(token)
        }
    }, [pathname])

    const fetchNotifications = async (token: string) => {
        try {
            const response = await fetch("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await response.json()
            if (response.ok) {
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error("Erreur chargement notifications:", error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("userType")
        toast({ title: "Déconnexion réussie" })
        router.push("/")
    }

    if (loading) return null

    if (!user) return null

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            {/* Navigation Sidebar (Mobile) */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-80 p-0">
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {user.nom?.[0]}{user.prenom?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">
                                        {user.nom} {user.prenom}
                                    </p>
                                    <p className="text-sm text-gray-500">{user.matricule}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="flex-1 p-4 space-y-1">
                            <Link
                                href="/etudiant/dashboard"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    pathname === "/etudiant/dashboard" ? "bg-primary/5 text-primary font-medium" : "hover:bg-gray-100 text-gray-600"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Home className="h-5 w-5" />
                                <span>Tableau de bord</span>
                            </Link>
                            <Link
                                href="/etudiant/nouvelle-demande"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    pathname === "/etudiant/nouvelle-demande" ? "bg-primary/5 text-primary font-medium" : "hover:bg-gray-100 text-gray-600"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Plus className="h-5 w-5" />
                                <span>Nouvelle demande</span>
                            </Link>
                            <Link
                                href="/etudiant/demandes"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    pathname === "/etudiant/demandes" ? "bg-primary/5 text-primary font-medium" : "hover:bg-gray-100 text-gray-600"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FileText className="h-5 w-5" />
                                <span>Mes demandes</span>
                            </Link>
                            <Link
                                href="/etudiant/notifications"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
                                    pathname === "/etudiant/notifications" ? "bg-primary/5 text-primary font-medium" : "hover:bg-gray-100 text-gray-600"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Bell className="h-5 w-5" />
                                <span>Notifications</span>
                                {notifications.filter(n => !n.lu).length > 0 && (
                                    <Badge className="absolute left-8 ml-3 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                                        {notifications.filter(n => !n.lu).length}
                                    </Badge>
                                )}
                            </Link>
                            <Link
                                href="/etudiant/profile"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    pathname === "/etudiant/profile" ? "bg-primary/5 text-primary font-medium" : "hover:bg-gray-100 text-gray-600"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <User className="h-5 w-5" />
                                <span>Mon profil</span>
                            </Link>
                        </nav>

                        <div className="p-4 border-t">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-gray-600 hover:text-red-600"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                                Déconnexion
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>

                            <div className="hidden lg:flex items-center gap-2">
                                <div className="h-12 w-12 rounded-lg flex items-center justify-center">
                                    {/* Using img tag as in user request, assuming icon.png exists in public */}
                                    <img src="/icon.png" alt="" sizes="16" />
                                </div>
                                <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Scolarité
                                </span>
                            </div>

                            <nav className="hidden lg:flex items-center gap-6 ml-8">
                                <Link
                                    href="/etudiant/dashboard"
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        pathname === "/etudiant/dashboard" ? "text-primary" : "text-gray-700 hover:text-primary"
                                    )}
                                >
                                    Tableau de bord
                                </Link>
                                <Link
                                    href="/etudiant/demandes"
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        pathname === "/etudiant/demandes" ? "text-primary" : "text-gray-700 hover:text-primary"
                                    )}
                                >
                                    Mes demandes
                                </Link>
                                <Link
                                    href="/etudiant/nouvelle-demande"
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        pathname === "/etudiant/nouvelle-demande" ? "text-primary" : "text-gray-700 hover:text-primary"
                                    )}
                                >
                                    Nouvelle demande
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href="/etudiant/notifications">
                                <Button variant="ghost" size="icon" className="relative cursor-pointer">
                                    <Bell className="h-5 w-5" />
                                    {notifications.filter(n => !n.lu).length > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                            {notifications.filter(n => !n.lu).length}
                                        </span>
                                    )}
                                </Button>
                            </Link>

                            <div className="hidden lg:flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {user.nom?.[0]}{user.prenom?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden xl:block">
                                    <p className="text-sm font-medium">
                                        {user.nom}  {user.prenom}
                                    </p>
                                    <p className="text-xs text-gray-500">Étudiant</p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden lg:flex cursor-pointer"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {children}
        </div>
    )
}
