"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Mail,
  CreditCard,
  Building,
  User,
  Phone
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface DocumentDetail {
  id: number
  type_document: {
    libelle: string
    code: string
  }
  niveau?: string
  annee_universitaire?: string
  prix: number
  statut?: string
}

interface DemandeDetail {
  id: number
  created_at: string
  statut: string
  montant_total: number
  validee_le?: string
  commentaire_rejet?: string
  documents: DocumentDetail[]
  etudiant?: {
    nom: string
    prenom: string
    matricule: string
    email: string
    filiere: string
  }
  paiement?: {
    mode: string
    reference: string
    date: string
  }
}

interface TimelineEvent {
  id: number
  statut: string
  date: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export default function DemandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [demande, setDemande] = useState<DemandeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    fetchDemandeDetail(token)
  }, [unwrappedParams.id])

  const fetchDemandeDetail = async (token: string) => {
    try {
      const response = await fetch(`/api/demandes/${unwrappedParams.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setDemande(data.demande)
        generateTimeline(data.demande)
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.error || "Impossible de charger la demande",
        })
        router.push("/etudiant/dashboard")
      }
    } catch (error) {
      console.error("Erreur chargement demande:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTimeline = (demande: DemandeDetail) => {
    const events: TimelineEvent[] = [
      {
        id: 1,
        statut: "SOUMISE",
        date: demande.created_at,
        description: "Demande soumise",
        icon: <Clock className="h-4 w-4" />,
        completed: true,
      },
      {
        id: 2,
        statut: "EN_ATTENTE",
        date: demande.created_at,
        description: "En attente de validation",
        icon: <Clock className="h-4 w-4" />,
        completed: ["VALIDEE", "EN_PREPARATION", "PRET", "RETIRE", "REJETEE"].includes(demande.statut),
      },
      {
        id: 3,
        statut: "VALIDEE",
        date: demande.validee_le || "",
        description: "Demande validée",
        icon: <CheckCircle className="h-4 w-4" />,
        completed: ["VALIDEE", "EN_PREPARATION", "PRET", "RETIRE"].includes(demande.statut),
      },
      {
        id: 4,
        statut: "EN_PREPARATION",
        date: "",
        description: "En cours de préparation",
        icon: <FileText className="h-4 w-4" />,
        completed: ["EN_PREPARATION", "PRET", "RETIRE"].includes(demande.statut),
      },
      {
        id: 5,
        statut: "PRET",
        date: "",
        description: "Prêt à récupérer",
        icon: <CheckCircle className="h-4 w-4" />,
        completed: ["PRET", "RETIRE"].includes(demande.statut),
      },
      {
        id: 6,
        statut: "RETIRE",
        date: "",
        description: "Document retiré",
        icon: <Download className="h-4 w-4" />,
        completed: demande.statut === "RETIRE",
      },
    ]

    if (demande.statut === "REJETEE") {
      events.push({
        id: 7,
        statut: "REJETEE",
        date: demande.validee_le || "",
        description: "Demande rejetée",
        icon: <XCircle className="h-4 w-4" />,
        completed: true,
      })
    }

    setTimeline(events)
  }

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return {
          color: "border-amber-500 bg-amber-50 text-amber-800",
          icon: <Clock className="h-5 w-5" />,
          label: "En attente de validation",
          progress: 20,
        }
      case "VALIDEE":
        return {
          color: "border-blue-500 bg-blue-50 text-blue-800",
          icon: <CheckCircle className="h-5 w-5" />,
          label: "Validée",
          progress: 40,
        }
      case "REJETEE":
        return {
          color: "border-red-500 bg-red-50 text-red-800",
          icon: <XCircle className="h-5 w-5" />,
          label: "Rejetée",
          progress: 100,
        }
      case "EN_PREPARATION":
        return {
          color: "border-indigo-500 bg-indigo-50 text-indigo-800",
          icon: <FileText className="h-5 w-5" />,
          label: "En cours de préparation",
          progress: 60,
        }
      case "PRET":
        return {
          color: "border-green-500 bg-green-50 text-green-800",
          icon: <CheckCircle className="h-5 w-5" />,
          label: "Prêt à récupérer",
          progress: 80,
        }
      case "RETIRE":
        return {
          color: "border-gray-500 bg-gray-50 text-gray-800",
          icon: <Download className="h-5 w-5" />,
          label: "Retiré",
          progress: 100,
        }
      default:
        return {
          color: "border-gray-500 bg-gray-50 text-gray-800",
          icon: <Clock className="h-5 w-5" />,
          label: statut,
          progress: 0,
        }
    }
  }

  const getDocumentTypeIcon = (code: string) => {
    const icons: Record<string, React.ReactNode> = {
      ATTESTATION: <FileText className="h-5 w-5" />,
      RELEVE: <FileText className="h-5 w-5" />,
      DIPLOME: <FileText className="h-5 w-5" />,
      CERTIFICAT: <FileText className="h-5 w-5" />,
    }
    return icons[code] || <FileText className="h-5 w-5" />
  }

  const handlePrint = () => {
    window.print()
  }

  const handleContact = () => {
    toast({
      title: "Contact",
      description: "Redirection vers le service support",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des détails...</p>
        </div>
      </div>
    )
  }

  if (!demande) return null

  const statusConfig = getStatusConfig(demande.statut)

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/etudiant/demandes">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Détails de la demande
            </h1>
            <p className="text-gray-600">Visualisez les détails et l'avancement</p>
          </div>
        </div>

        <div className="flex items-center">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-1 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Header Card */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="relative">
              <div className="absolute"></div>
              <CardHeader className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">
                      Demande #{demande.id}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      Créée le {new Date(demande.created_at).toLocaleDateString("fr-FR", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <Badge className={`px-4 py-2 text-sm font-medium ${statusConfig.color} border`}>
                    <div className="flex items-center gap-2">
                      {statusConfig.icon}
                      {statusConfig.label}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
            </div>

            <CardContent className="pt-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-medium">{statusConfig.progress}%</span>
                </div>
                <Progress value={statusConfig.progress} className="h-2" />
              </div>

              {/* Status Messages */}
              {demande.statut === "REJETEE" && demande.commentaire_rejet && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Demande rejetée</h4>
                      <p className="text-red-700">{demande.commentaire_rejet}</p>
                    </div>
                  </div>
                </div>
              )}

              {demande.statut === "PRET" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Documents prêts !</h4>
                      <p className="text-green-700 mb-2">
                        Vos documents sont disponibles au service de scolarité.
                      </p>
                      <div className="text-sm text-green-600 space-y-1">
                        <p>📍 <strong>Lieu :</strong> Bureau scolarité - Maninday</p>
                        <p>🕒 <strong>Horaires :</strong> Lundi au vendredi, 8h-12h et 14h-17h</p>
                        <p>📋 <strong>À apporter :</strong> Carte d'étudiant et pièce d'identité</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Documents demandés</CardTitle>
              <CardDescription>
                {demande.documents.length} document{demande.documents.length > 1 ? 's' : ''} dans cette demande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {demande.documents.map((doc, index) => (
                  <div key={doc.id} className="group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          {getDocumentTypeIcon(doc.type_document.code)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {doc.type_document.libelle}
                          </h4>
                          <div className="space-y-1">
                            {doc.niveau && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Niveau :</span> {doc.niveau}
                              </p>
                            )}
                            {doc.annee_universitaire && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Année universitaire :</span> {doc.annee_universitaire}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {doc.prix.toLocaleString()} Ar
                        </p>
                        {doc.statut && (
                          <Badge variant="outline" className="mt-2">
                            {doc.statut}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {index < demande.documents.length - 1 && (
                      <Separator className="my-6" />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Montant total</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {demande.montant_total.toLocaleString()} Ar
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Suivi de la demande</CardTitle>
              <CardDescription>Historique des étapes de traitement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-8">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4">
                      <div className={cn(
                        "shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 z-10",
                        event.completed
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      )}>
                        {event.icon}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {event.description}
                          </h4>
                          {event.date && (
                            <span className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">
                          {event.statut === "SOUMISE" && "Votre demande a été enregistrée avec succès."}
                          {event.statut === "EN_ATTENTE" && "En attente de validation par l'administration."}
                          {event.statut === "VALIDEE" && "La demande a été validée et est en cours de traitement."}
                          {event.statut === "EN_PREPARATION" && "Les documents sont en cours de préparation."}
                          {event.statut === "PRET" && "Les documents sont disponibles au service de scolarité."}
                          {event.statut === "RETIRE" && "Les documents ont été retirés."}
                          {event.statut === "REJETEE" && "La demande a été rejetée. Voir les motifs ci-dessus."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}