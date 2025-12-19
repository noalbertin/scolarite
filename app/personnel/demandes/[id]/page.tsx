"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Package,
  User,
  FileText,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  Hash,
  Loader2,
  AlertCircle,
  MapPin,
  User2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function DemandeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [demande, setDemande] = useState<any>(null)
  const [commentaire, setCommentaire] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchDemande(token)
  }, [params.id])

  const fetchDemande = async (token: string) => {
    try {
      const response = await fetch(`/api/personnel/demandes/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setDemande(data.demande)
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/personnel/demandes/${params.id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentaire }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Action réussie",
          description: data.message,
          className: "bg-linear-to-r from-green-50 to-emerald-50 border-green-200",
        })
        fetchDemande(token)
        setCommentaire("")
      } else {
        toast({
          title: "❌ Erreur",
          description: data.error,
          variant: "destructive",
          className: "border-red-200",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Erreur de connexion",
        description: "Veuillez vérifier votre connexion internet",
        variant: "destructive",
        className: "border-red-200",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 text-amber-800"
      case "VALIDEE":
        return "border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-800"
      case "REJETEE":
        return "border-red-200 bg-linear-to-r from-red-50 to-rose-50 text-red-800"
      case "EN_PREPARATION":
        return "border-purple-200 bg-linear-to-r from-purple-50 to-violet-50 text-purple-800"
      case "PRET":
        return "border-gray-200 bg-linear-to-r from-gray-50 to-slate-50 text-gray-800"
      case "RETIRE":
        return "border-gray-200 bg-linear-to-r from-gray-50 to-slate-50 text-gray-800"
      default:
        return "border-gray-200 bg-linear-to-r from-gray-50 to-slate-50 text-gray-800"
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "⏳"
      case "VALIDEE":
        return "✅"
      case "REJETEE":
        return "❌"
      case "EN_PREPARATION":
        return "📦"
      case "PRET":
        return "📬"
      case "RETIRE":
        return "👋"
      default:
        return "📄"
    }
  }

  const getStatusProgress = (statut: string) => {
    const statusOrder = ["EN_ATTENTE", "VALIDEE", "EN_PREPARATION", "PRET", "RETIRE", "REJETEE"]
    const index = statusOrder.indexOf(statut)
    // Adjust logic to handle rejected/withdrawn correctly in progress bar
    if (statut === "REJETEE") return 100
    return ((index + 1) / (statusOrder.length - 1)) * 100 // -1 because REJETEE is a separate terminal state
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium text-gray-600">Chargement des détails de la demande...</p>
          <Progress value={33} className="w-64" />
        </div>
      </div>
    )
  }

  if (!demande) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md border-dashed">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Demande introuvable</h2>
            <p className="text-gray-500 mb-6">La demande que vous recherchez n'existe pas ou a été supprimée.</p>
            <Button asChild className="gap-2 cursor-pointer">
              <Link href="/personnel/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau de bord
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/personnel/dashboard">
                <Button variant="outline" size="icon" className="rounded-full cursor-pointer hover:bg-gray-100 transition-all">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Demande #{demande.id}</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(demande.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(demande.statut)} text-sm px-4 py-2 font-medium border shadow-sm`}>
              {getStatusIcon(demande.statut)} {demande.statut.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Progression de la demande</span>
            <span className="text-sm font-semibold text-primary">{demande.statut.replace("_", " ")}</span>
          </div>
          <Progress value={getStatusProgress(demande.statut)} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>En attente</span>
            <span>Validée</span>
            <span>En préparation</span>
            <span>Prête</span>
            <span>Retirée</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Student Info & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Informations de l'étudiant</CardTitle>
                    <CardDescription>Détails du demandeur</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Nom complet</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="font-semibold">
                          {demande.etudiant.nom} {demande.etudiant.prenom}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Matricule</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <p className="font-mono font-semibold">{demande.etudiant.matricule}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Email</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="font-medium truncate">{demande.etudiant.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Téléphone</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{demande.etudiant.telephone || "Non renseigné"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Père</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <User2 className="h-4 w-4 text-gray-400" />
                        <p className="font-medium truncate">{demande.etudiant.nom_pere}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Lieu de naissance</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="font-medium truncate">{demande.etudiant.lieu_naissance}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Mère</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <User2 className="h-4 w-4 text-gray-400" />
                        <p className="font-medium truncate">{demande.etudiant.nom_mere}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 uppercase tracking-wider">Date de naissance</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">
                          {new Date(demande.etudiant.date_naissance).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Requested */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-emerald-100 to-teal-100 rounded-lg">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Documents demandés</CardTitle>
                    <CardDescription>Liste des documents et tarifs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demande.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{doc.type_document.libelle}</p>
                          {doc.niveau && (
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {doc.niveau}
                              </Badge>
                              <span>•</span>
                              <span>{doc.annee_universitaire}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-lg text-primary">{doc.prix.toLocaleString()} Ar</p>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">Montant total</p>
                        <p className="text-sm text-gray-600">Tous frais inclus</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-primary">{demande.montant_total.toLocaleString()} Ar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  Statut de la demande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-lg">
                    <Badge className={`${getStatusColor(demande.statut)} w-full justify-center py-2 text-base`}>
                      {getStatusIcon(demande.statut)} {demande.statut.replace("_", " ")}
                    </Badge>
                  </div>

                  {demande.statut === "EN_ATTENTE" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="commentaire" className="text-sm font-medium">
                          Commentaire <span className="text-gray-500">(Optionnel pour validation)</span>
                        </Label>
                        <Textarea
                          id="commentaire"
                          value={commentaire}
                          onChange={(e) => setCommentaire(e.target.value)}
                          placeholder="Ajoutez un commentaire ou une remarque..."
                          className="min-h-25 resize-none border-gray-200 focus:border-primary"
                          rows={4}
                        />
                        {demande.statut === "REJETEE" && !commentaire && (
                          <p className="text-sm text-amber-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Un commentaire est obligatoire pour rejeter la demande
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="gap-2 cursor-pointer bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-sm"
                              disabled={actionLoading}
                            >
                              {actionLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Valider
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-gray-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                Confirmer la validation
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Cette action va valider la demande. L'étudiant recevra une notification par email.
                                {commentaire && (
                                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <p className="text-sm font-medium text-emerald-800">Votre commentaire :</p>
                                    <p className="text-sm text-emerald-700 mt-1">{commentaire}</p>
                                  </div>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer border-gray-300">Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="cursor-pointer bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                                onClick={() => handleAction("valider")}
                              >
                                Confirmer la validation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="gap-2 cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={actionLoading}
                            >
                              {actionLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Rejeter
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-gray-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                Confirmer le rejet
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Cette action va rejeter la demande. L'étudiant sera notifié du rejet.
                                {!commentaire && (
                                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <p className="text-sm font-medium text-amber-800">⚠️ Un commentaire est requis pour expliquer le rejet.</p>
                                  </div>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer border-gray-300">Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="cursor-pointer bg-linear-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                                onClick={() => handleAction("rejeter")}
                                disabled={!commentaire}
                              >
                                Confirmer le rejet
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}

                  {demande.statut === "VALIDEE" && (
                    <Button
                      onClick={() => handleAction("preparer")}
                      className="w-full gap-2 cursor-pointer bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                      Marquer comme prêt
                    </Button>
                  )}

                  {demande.statut === "PRET" && (
                    <Button
                      onClick={() => handleAction("retirer")}
                      className="w-full gap-2 cursor-pointer bg-linear-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Marquer comme retiré
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rejection Comment */}
            {demande.commentaire_rejet && (
              <Card className="border-red-200 bg-linear-to-br from-red-50/50 to-rose-50/50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Motif du rejet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-white rounded-lg border border-red-100">
                    <p className="text-gray-700 whitespace-pre-wrap">{demande.commentaire_rejet}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-100">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Cette demande a été rejetée par le personnel.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}