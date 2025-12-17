"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    FileText,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Demande {
    id: number
    created_at: string
    statut: string
    montant_total: number
    nb_documents: number
    type: string
}

export default function EtudiantDemandes() {
    const router = useRouter()
    const { toast } = useToast()
    const [user, setUser] = useState<any>(null)
    const [demandes, setDemandes] = useState<Demande[]>([])
    const [filteredDemandes, setFilteredDemandes] = useState<Demande[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

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

    useEffect(() => {
        let result = demandes

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(d =>
                getDemandeType(d.type).toLowerCase().includes(lowerQuery) ||
                d.id.toString().includes(lowerQuery)
            )
        }

        if (statusFilter !== "ALL") {
            result = result.filter(d => d.statut === statusFilter)
        }

        setFilteredDemandes(result)
    }, [searchQuery, statusFilter, demandes])

    const fetchDemandes = async (token: string) => {
        try {
            const response = await fetch("/api/demandes", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await response.json()
            if (response.ok) {
                setDemandes(data.demandes || [])
                setFilteredDemandes(data.demandes || [])
            }
        } catch (error) {
            console.error("Erreur chargement demandes:", error)
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de charger les demandes."
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case "EN_ATTENTE":
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">En attente</Badge>
            case "VALIDEE":
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Validée</Badge>
            case "REJETEE":
                return <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100">Rejetée</Badge>
            case "EN_PREPARATION":
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">En préparation</Badge>
            case "PRET":
                return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Prêt</Badge>
            case "RETIRE":
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Retiré</Badge>
            default:
                return <Badge variant="outline">{statut}</Badge>
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
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes Demandes</h1>
                        <p className="text-gray-600 mt-2">
                            Suivez l'état d'avancement de vos demandes de documents
                        </p>
                    </div>
                    <Link href="/etudiant/nouvelle-demande">
                        <Button className="gap-2 cursor-pointer">
                            <Plus className="h-4 w-4" />
                            Nouvelle demande
                        </Button>
                    </Link>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="p-4 sm:p-6 border-b bg-gray-50/50">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Rechercher une demande..."
                                    className="pl-9 bg-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px] bg-white">
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous les statuts</SelectItem>
                                        <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                                        <SelectItem value="EN_PREPARATION">En préparation</SelectItem>
                                        <SelectItem value="PRET">Prêt</SelectItem>
                                        <SelectItem value="VALIDEE">Validée</SelectItem>
                                        <SelectItem value="REJETEE">Rejetée</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-gray-500 mt-4">Chargement de vos demandes...</p>
                            </div>
                        ) : filteredDemandes.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Aucune demande trouvée</h3>
                                <p className="text-gray-500 mt-2 mb-6">
                                    {searchQuery || statusFilter !== "ALL"
                                        ? "Essayez de modifier vos filtres de recherche."
                                        : "Vous n'avez pas encore effectué de demande."}
                                </p>
                                {(!searchQuery && statusFilter === "ALL") && (
                                    <Link href="/etudiant/nouvelle-demande">
                                        <Button variant="outline">Créer une demande</Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableHead className="w-[100px]">ID</TableHead>
                                            <TableHead>Type de document</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDemandes.map((demande) => (
                                            <TableRow key={demande.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => router.push(`/etudiant/demandes/${demande.id}`)}>
                                                <TableCell className="font-medium">#{demande.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">
                                                            {getDemandeType(demande.type)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-500">
                                                    {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {demande.montant_total.toLocaleString()} Ar
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(demande.statut)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => router.push(`/etudiant/demandes/${demande.id}`)} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Voir les détails
                                                            </DropdownMenuItem>
                                                            {demande.statut === "PRET" && (
                                                                <DropdownMenuItem className="cursor-pointer">
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Télécharger
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
