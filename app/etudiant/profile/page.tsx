"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Save,
    Loader2,
    Eye,
    EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EtudiantProfile() {
    const router = useRouter()
    const { toast } = useToast()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        email: "",
        telephone: "",
        adresse: "",
        ville: ""
    })

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const userData = localStorage.getItem("user")

        if (!token || !userData) {
            router.push("/auth/login")
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setFormData({
            email: parsedUser.email || "",
            telephone: parsedUser.telephone || "",
            adresse: parsedUser.adresse || "",
            ville: parsedUser.ville || ""
        })

        setLoading(false)
    }, [])

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handlePasswordUpdate = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Veuillez remplir tous les champs"
            })
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Les nouveaux mots de passe ne correspondent pas"
            })
            return
        }

        try {
            const token = localStorage.getItem("token")
            const response = await fetch("/api/auth/update-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Succès",
                    description: "Mot de passe mis à jour avec succès"
                })
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: data.error || "Erreur lors de la mise à jour"
                })
            }
        } catch (error) {
            console.error("Erreur:", error)
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Erreur de connexion au serveur"
            })
        }
    }



    const handleSave = async () => {
        setSaving(true)
        
        try {
            const token = localStorage.getItem("token")
            
            const response = await fetch("/api/etudiant", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: formData.email,
                    telephone: formData.telephone
                })
            })

            const data = await response.json()

            if (response.ok) {
                // Mettre à jour le localStorage avec les nouvelles données
                const updatedUser = { ...user, ...data.user }
                localStorage.setItem("user", JSON.stringify(updatedUser))
                setUser(updatedUser)
                
                toast({
                    title: "Profil mis à jour",
                    description: "Vos informations ont été enregistrées avec succès."
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: data.error || "Erreur lors de la mise à jour"
                })
            }
        } catch (error) {
            console.error("Erreur:", error)
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Erreur de connexion au serveur"
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
                    <p className="text-gray-600 mt-2">
                        Gérez vos informations personnelles et vos préférences
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Colonne de gauche - Carte Profil */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-0 shadow-lg bg-linear-to-br from-white to-gray-50 overflow-hidden">
                            <div className="h-32 bg-primary/10 w-full relative">
                                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/5"></div>
                            </div>
                            <CardContent className="pt-0 relative">
                                <div className="flex flex-col items-center -mt-16 mb-4">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                                        <AvatarFallback className="bg-primary text-white text-3xl font-bold">
                                            {user.nom?.[0]}{user.prenom?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="mt-4 text-center">
                                        <h2 className="text-xl font-bold text-gray-900">{user.nom} {user.prenom}</h2>
                                        <p className="text-sm text-gray-500 font-medium">{user.matricule}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 py-4 min-w-0">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        <Mail className="h-4 w-4 text-primary shrink-0" />
                                        <span className="truncate">{user.email || "Non renseigné"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        <Phone className="h-4 w-4 text-primary shrink-0" />
                                        <span className="truncate">{formData.telephone || "Non renseigné"}</span>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="text-center">
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                        {user.filiere || "Étudiant"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Colonne de droite - Détails et Modification */}
                    <div className="md:col-span-2">
                        <Tabs defaultValue="infos" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100/80 backdrop-blur cursor-pointer">
                                <TabsTrigger value="infos">Informations</TabsTrigger>
                                <TabsTrigger value="security">Sécurité</TabsTrigger>
                            </TabsList>

                            <TabsContent value="infos">
                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle>Informations Personnelles</CardTitle>
                                        <CardDescription>
                                            Modifiez vos coordonnées et informations de contact.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="nom">Nom</Label>
                                                <Input id="nom" value={user.nom} disabled className="bg-gray-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="prenom">Prénom</Label>
                                                <Input id="prenom" value={user.prenom} disabled className="bg-gray-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="date_naissance">Date de naissance</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input
                                                        id="date_naissance"
                                                        value={user.date_naissance ? new Date(user.date_naissance).toLocaleDateString() : ""}
                                                        disabled
                                                        className="pl-9 bg-gray-50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input id="lieu_naissance" value={user.lieu_naissance || ""} disabled className="pl-9 bg-gray-50" />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="font-medium text-gray-900">Coordonnées</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="votre@email.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="telephone">Téléphone</Label>
                                                    <Input
                                                        id="telephone"
                                                        value={formData.telephone}
                                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                                        placeholder="+261 34 00 000 00"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end border-t bg-gray-50/50 p-6">
                                        <Button onClick={handleSave} disabled={saving} className="min-w-30 cursor-pointer">
                                            {saving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Enregistrement...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Enregistrer
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="security">
                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle>Sécurité du compte</CardTitle>
                                        <CardDescription>Gérez votre mot de passe et la sécurité de votre compte</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="current-password">Mot de passe actuel</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="current-password"
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        className="pr-10"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? (
                                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="new-password"
                                                        type={showNewPassword ? "text" : "password"}
                                                        className="pr-10"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirm-password"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className="pr-10"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4 text-gray-500 " />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end border-t bg-gray-50/50 p-6">
                                        <Button className="cursor-pointer" onClick={handlePasswordUpdate}>
                                            Mettre à jour le mot de passe
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </main>
    )
}
