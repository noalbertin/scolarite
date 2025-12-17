"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bell,
  FileText,
  Plus,
  User,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Demande {
  id: number
  created_at: string
  statut: string
  montant_total: number
  nb_documents: number
  type: string
}

export default function EtudiantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    setUser(JSON.parse(userData))
    fetchDemandes(token)
  }, [])

  const fetchDemandes = async (token: string) => {
    try {
      const response = await fetch("/api/demandes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setDemandes(data.demandes || [])
      }
    } catch (error) {
      console.error("Erreur chargement demandes:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return <Clock className="h-4 w-4" />
      case "VALIDEE":
      case "PRET":
        return <CheckCircle className="h-4 w-4" />
      case "REJETEE":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "VALIDEE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "REJETEE":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "EN_PREPARATION":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "PRET":
        return "bg-green-100 text-green-800 border-green-200"
      case "RETIRE":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "En attente"
      case "VALIDEE":
        return "Validée"
      case "REJETEE":
        return "Rejetée"
      case "EN_PREPARATION":
        return "En préparation"
      case "PRET":
        return "Prêt à récupérer"
      case "RETIRE":
        return "Retiré"
      default:
        return statut
    }
  }

  const getDemandeType = (type: string) => {
    const types: Record<string, string> = {
      "ATTESTATION": "Attestation de scolarité",
      "RELEVE": "Relevé de notes",
      "DIPLOME": "Diplôme",
      "CERTIFICAT": "Certificat de réussite",
      "AUTRE": "Autre document"
    }
    return types[type] || "Document"
  }

  if (!user) return null

  return (
    <>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bonjour, {user.prenom} 👋
              </h1>
              <p className="text-gray-600">
                Gérez vos demandes de documents universitaires
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white">
                <User className="h-3 w-3 m-2" />
                {user.matricule}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Action Card */}
          <Card className="lg:col-span-2 bg-linear-to-br from-white to-gray-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nouvelle demande de document
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Faites une demande d'attestation, relevé de notes ou autre document administratif
                  </p>
                  <Link href="/etudiant/nouvelle-demande">
                    <Button className="gap-2 cursor-pointer">
                      <Plus className="h-4 w-4" />
                      Commencer une demande
                    </Button>
                  </Link>
                </div>
                <div className="p-4 rounded-xl bg-primary/5">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Accès rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/etudiant/profile">
                  <Button variant="outline" className="w-full h-auto py-4 justify-start gap-3 cursor-pointer">
                    <User className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Mon profil</p>
                      <p className="text-xs text-gray-500">Informations personnelles</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/etudiant/notifications">
                  <Button variant="outline" className="w-full h-auto py-4 justify-start gap-3 cursor-pointer">
                    <Bell className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Notifications</p>
                      <p className="text-xs text-gray-500">Voir vos notifications</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/etudiant/nouvelle-demande">
                  <Button variant="outline" className="w-full h-auto py-4 justify-start gap-3 cursor-pointer">
                    <Plus className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Nouvelle demande</p>
                      <p className="text-xs text-gray-500">Créer une demande</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total demandes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{demandes.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {demandes.filter(d => d.statut === "EN_ATTENTE").length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prêts</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {demandes.filter(d => d.statut === "PRET").length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    -
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-100">
                  <Bell className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demandes récentes */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Demandes récentes</CardTitle>
                <CardDescription>Historique de vos demandes</CardDescription>
              </div>
              <Link href="/etudiant/demandes">
                <Button variant="ghost" size="sm" className="gap-1 cursor-pointer">
                  Voir tout
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement des demandes...</p>
              </div>
            ) : demandes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune demande pour le moment</p>
                <Link href="/etudiant/nouvelle-demande">
                  <Button className="mt-4">Créer votre première demande</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {demandes.slice(0, 5).map((demande) => (
                  <Link key={demande.id} href={`/etudiant/demandes/${demande.id}`}>
                    <div className="group flex items-center mt-1 justify-between p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-primary/10 transition-colors">
                          <FileText className="h-5 w-5 text-gray-600 group-hover:text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getDemandeType(demande.type)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">
                              #{demande.id} • {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {demande.nb_documents} doc{demande.nb_documents > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {demande.montant_total.toLocaleString()} Ar
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(demande.statut)}
                            <Badge
                              variant="outline"
                              className={cn("border px-2 py-0.5 text-xs", getStatusColor(demande.statut))}
                            >
                              {getStatusLabel(demande.statut)}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        
      </main>

    </>
  )
}