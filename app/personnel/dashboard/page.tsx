"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  LogOut,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Download,
  Users,
  Filter,
  ChevronRight,
  Search,
  Bell,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Demande {
  id: number
  created_at: string
  statut: string
  montant_total: number
  matricule: string
  nom: string
  prenom: string
  email: string
  nb_documents: number
}

interface Notification {
  id: number
  demande_id: number
  type: string
  message: string
  lu: boolean
  created_at: string
  nom: string
  prenom: string
  matricule: string
  demande_statut: string
}

export default function PersonnelDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("EN_ATTENTE")
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    validated: 0,
    ready: 0,
    withdrawn: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    const userType = localStorage.getItem("userType")

    if (!token || !userData || userType !== "personnel") {
      router.push("/auth/login")
      return
    }

    setUser(JSON.parse(userData))
    fetchDemandes(token)
    fetchStats(token)
    fetchNotifications(token)
    fetchUnreadCount(token)

    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(() => {
      fetchUnreadCount(token)
    }, 30000)

    return () => clearInterval(interval)
  }, [filter])

  const fetchDemandes = async (token: string) => {
    try {
      const response = await fetch(`/api/personnel/demandes?statut=${filter}`, {
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

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/personnel/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error("Erreur chargement stats:", error)
    }
  }

  const fetchNotifications = async (token: string) => {
    try {
      const response = await fetch("/api/personnel/notifications", {
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

  const fetchUnreadCount = async (token: string) => {
    try {
      const response = await fetch("/api/personnel/notifications/count", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setUnreadCount(data.count || 0)
      }
    } catch (error) {
      console.error("Erreur chargement compteur:", error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      if (!notification.lu) {
        await fetch(`/api/personnel/notifications/${notification.id}/lu`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchUnreadCount(token)
        fetchNotifications(token)
      }
      router.push(`/personnel/demandes/${notification.demande_id}`)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userType")
    toast({ title: "Déconnexion réussie" })
    router.push("/")
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "VALIDEE":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "REJETEE":
        return "bg-rose-500/10 text-rose-600 border-rose-200"
      case "EN_PREPARATION":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "PRET":
        return "bg-violet-500/10 text-violet-600 border-violet-200"
      case "RETIRE":
        return "bg-gray-500/10 text-gray-600 border-gray-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return <Clock className="h-4 w-4" />
      case "VALIDEE":
        return <CheckCircle2 className="h-4 w-4" />
      case "REJETEE":
        return <XCircle className="h-4 w-4" />
      case "EN_PREPARATION":
        return <Package className="h-4 w-4" />
      case "PRET":
        return <Download className="h-4 w-4" />
      case "RETIRE":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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
        return "Prêt"
      case "RETIRE":
        return "Retiré"
      default:
        return statut
    }
  }

  const filteredDemandes = demandes.filter(demande =>
    demande.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    demande.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    demande.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/personnel/dashboard" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center">
                {/* Using img tag as in user request, assuming icon.png exists in public */}
                <img src="/icon.png" alt="" sizes="16" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Scolarité
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative cursor-pointer">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-3 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <p className="text-xs text-slate-500">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="px-4 py-3 cursor-pointer hover:bg-slate-50 border-b last:border-b-0"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notification.lu ? "bg-slate-300" : "bg-blue-500"
                            }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${notification.lu ? "text-slate-600" : "text-slate-900 font-medium"
                              }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full">
              <User className="h-4 w-4 text-slate-500" />
              <div className="text-sm">
                <p className="font-medium text-slate-900">
                  {user.nom} {user.prenom}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
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
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                Bonjour, {user.prenom} 👋
              </h1>
              <p className="text-slate-600">Gérez les demandes de documents administratifs</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher une demande..."
                  className="pl-10 w-full lg:w-64 rounded-full border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-linear-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Demandes</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-linear-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">En attente</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(stats.pending / Math.max(stats.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-linear-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Validées</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.validated}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <span className="font-medium">{Math.round((stats.validated / Math.max(stats.total, 1)) * 100)}%</span> du total
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-linear-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Prêtes</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.ready}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-linear-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Retirés</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.withdrawn}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres Tabs */}
        <Card className="border-0 shadow-sm mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle>Demandes de documents</CardTitle>
                <CardDescription>
                  Gérez les demandes de documents administratifs des étudiants
                </CardDescription>
              </div>
              <Tabs defaultValue="EN_ATTENTE" className="w-full lg:w-auto" onValueChange={setFilter}>
                <TabsList className="grid grid-cols-5 lg:flex">
                  <TabsTrigger value="EN_ATTENTE" className="gap-2 cursor-pointer">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">En attente</span>
                  </TabsTrigger>
                  <TabsTrigger value="VALIDEE" className="gap-2 cursor-pointer">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Validées</span>
                  </TabsTrigger>
                  <TabsTrigger value="PRET" className="gap-2 cursor-pointer">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Prêtes</span>
                  </TabsTrigger>
                  <TabsTrigger value="RETIRE" className="gap-2 cursor-pointer">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Retirés</span>
                  </TabsTrigger>
                  <TabsTrigger value="REJETEE" className="gap-2 cursor-pointer">
                    <XCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Rejetées</span>
                  </TabsTrigger>
                  <TabsTrigger value="ALL" className="cursor-pointer">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Toutes</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {/* Liste des demandes */}
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-slate-600">Chargement des demandes...</p>
              </div>
            ) : filteredDemandes.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">Aucune demande trouvée</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  {searchQuery ? "Aucune demande ne correspond à votre recherche." : "Aucune demande disponible pour le moment."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDemandes.map((demande) => (
                  <Link key={demande.id} href={`/personnel/demandes/${demande.id}`}>
                    <Card className="group mt-1 hover:shadow-md transition-all duration-200 border-slate-200 hover:border-blue-300 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-slate-900">Demande #{demande.id}</h3>
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(demande.statut)} flex items-center gap-1.5`}
                                >
                                  {getStatusIcon(demande.statut)}
                                  {getStatusLabel(demande.statut)}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {demande.nom} {demande.prenom}
                                </span>
                                <span>•</span>
                                <span>Matricule: {demande.matricule}</span>
                                <span>•</span>
                                <span>{demande.nb_documents} document(s)</span>
                                <span>•</span>
                                <span>
                                  {new Date(demande.created_at).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">
                                {demande.montant_total.toLocaleString()} Ar
                              </p>
                              <p className="text-sm text-slate-500">Montant total</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}