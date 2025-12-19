"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Notification {
    id: number
    demande_id: number
    message: string
    created_at: string
    lu: boolean
}

export default function NotificationsPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/auth/login")
            return
        }

        fetchNotifications(token)
    }, [])

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
        } finally {
            setLoading(false)
        }
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.lu) {
            const token = localStorage.getItem("token")
            if (token) {
                try {
                    await fetch(`/api/notifications/${notification.id}/lu`, {
                        method: "PUT",
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    // Optimistic update of UI
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === notification.id ? { ...n, lu: true } : n))
                    )
                } catch (error) {
                    console.error("Erreur:", error)
                }
            }
        }

        // Redirect to demand detail page
        if (notification.demande_id) {
            router.push(`/etudiant/demandes/${notification.demande_id}`)
        }
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                        Retrouvez ici l'historique de vos notifications concernant vos demandes.
                        Cliquez sur une notification pour voir les détails de la demande.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
                    ) : notifications.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">Aucune notification</p>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 rounded-lg border transition-all cursor-pointer ${!notification.lu
                                        ? "bg-accent/10 border-accent hover:bg-accent/20"
                                        : "bg-card hover:bg-muted/50"
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex gap-3">
                                            {!notification.lu && (
                                                <span className="h-2 w-2 mt-2 rounded-full bg-destructive flex-shrink-0" />
                                            )}
                                            <p className={`${!notification.lu ? "font-semibold" : ""}`}>{notification.message}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(notification.created_at).toLocaleDateString("fr-FR")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}
