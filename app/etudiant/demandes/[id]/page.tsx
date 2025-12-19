"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
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
    telephone?: string
    nom_pere?: string
    nom_mere?: string
    date_naissance?: string
    lieu_naissance?: string
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

  const handleDownloadTicket = async () => {
    if (!demande) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune demande à télécharger",
      })
      return
    }

    try {
      const jsPDFModule = await import("jspdf")
      const jsPDF = jsPDFModule.default || (jsPDFModule as any).jsPDF
      const autoTableModule = await import("jspdf-autotable")
      const autoTable = autoTableModule.default || (autoTableModule as any)

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15

      // === MODERN GRADIENT HEADER ===
      // Création d'un dégradé moderne
      const gradient = doc.context2d.createLinearGradient(0, 0, pageWidth, 0)
      gradient.addColorStop(0, "#4f46e5") // Indigo-600
      gradient.addColorStop(1, "#7c3aed") // Violet-600

      // Header avec dégradé
      doc.setFillColor(79, 70, 229) // Fallback color
      doc.rect(0, 0, pageWidth, 50, "F")

      // Ajout du logo
      try {
        const logoUrl = "/icon.png"
        const logoResponse = await fetch(logoUrl)
        const logoBlob = await logoResponse.blob()
        const logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(logoBlob)
        })

        doc.addImage(logoBase64 as string, 'PNG', margin, 10, 30, 30)
      } catch (error) {
        console.warn("Logo non chargé, continuation sans logo")
      }

      // Titre principal
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(24)
      doc.text("TICKET DE DEMANDE", pageWidth / 2, 25, { align: "center" })

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text("SERVICE DE SCOLARITÉ", pageWidth / 2, 32, { align: "center" })

      // === DATE ET ÉTAT ===
      const currentY = 60
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}`, margin, currentY)

      // État de la demande
      const etatColor = demande.statut === "traité" ? "#10b981" :
        demande.statut === "en_cours" ? "#f59e0b" :
        demande.statut === "en_attente" ? "#6366f1" : "#6b7280"

      // Dimensions du badge
      const badgeWidth = 40
      const badgeHeight = 10
      const badgeX = pageWidth - margin - badgeWidth
      const badgeY = currentY - 5

      // Calcul du centre vertical exact
      const centerY = badgeY + (badgeHeight / 3)

      doc.setFillColor(etatColor)
      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16) // Taille réduite pour mieux s'adapter
      doc.setFont("helvetica", "bold")

      // Centrage parfait - Option 1: Utiliser align: "center" et middle
      doc.text(
        demande.statut.toUpperCase(), 
        badgeX + (badgeWidth / 2), // Centre horizontal
        centerY + 1, // Ajustement manuel pour le centrage vertical
        { 
          align: "center",
          baseline: "middle" // Cette option centre verticalement
        }
      )

// OU Option 2: Si jsPDF ne supporte pas 'baseline: "middle"', utiliser cette approche:
// doc.text(
//   demande.statut.toUpperCase(), 
//   badgeX + (badgeWidth / 2), 
//   centerY, 
//   { 
//     align: "center",
//     lineHeightFactor: 1.2
//   }
// )


      // === SECTION ÉTUDIANT ===
      const sectionY = currentY + 15
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.5)
      doc.line(margin, sectionY, pageWidth - margin, sectionY)

      doc.setTextColor(30, 41, 59)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("INFORMATIONS ÉTUDIANT", margin, sectionY + 10)

      // Carte d'information moderne
      doc.setFillColor(249, 250, 251)
      doc.roundedRect(margin, sectionY + 15, pageWidth - 2 * margin, 50, 5, 5, "F")
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.3)
      doc.roundedRect(margin, sectionY + 15, pageWidth - 2 * margin, 50, 5, 5, "S")

      // Colonne gauche
      const infoStartY = sectionY + 25
      doc.setTextColor(71, 85, 105)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Nom complet:", margin + 5, infoStartY)
      doc.setFont("helvetica", "normal")
      doc.text(`${demande.etudiant?.nom || ""} ${demande.etudiant?.prenom || ""}`, margin + 35, infoStartY)

      doc.setFont("helvetica", "bold")
      doc.text("Matricule:", margin + 5, infoStartY + 7)
      doc.setFont("helvetica", "normal")
      doc.text(demande.etudiant?.matricule || "", margin + 35, infoStartY + 7)

      doc.setFont("helvetica", "bold")
      doc.text("Email:", margin + 5, infoStartY + 14)
      doc.setFont("helvetica", "normal")
      doc.text(demande.etudiant?.email || "", margin + 35, infoStartY + 14)

      doc.setFont("helvetica", "bold")
      doc.text("Téléphone:", margin + 5, infoStartY + 21)
      doc.setFont("helvetica", "normal")
      doc.text(demande.etudiant?.telephone || "Non renseigné", margin + 35, infoStartY + 21)

      // Colonne droite
      const rightColX = pageWidth / 2 + 10
      doc.setFont("helvetica", "bold")
      doc.text("Date de naissance:", rightColX, infoStartY)
      doc.setFont("helvetica", "normal")
      const dateNaissance = demande.etudiant?.date_naissance
        ? new Date(demande.etudiant.date_naissance).toLocaleDateString("fr-FR")
        : "Non renseigné"
      doc.text(dateNaissance, rightColX + 45, infoStartY)

      doc.setFont("helvetica", "bold")
      doc.text("Lieu de naissance:", rightColX, infoStartY + 7)
      doc.setFont("helvetica", "normal")
      doc.text(demande.etudiant?.lieu_naissance || "Non renseigné", rightColX + 45, infoStartY + 7)

      doc.setFont("helvetica", "bold")
      doc.text("Nom du père:", rightColX, infoStartY + 14)
      doc.setFont("helvetica", "normal")
      doc.text(demande.etudiant?.nom_pere || "Non renseigné", rightColX + 45, infoStartY + 14)

      doc.setFont("helvetica", "bold")
      doc.text("Nom de la mère:", rightColX, infoStartY + 21)
      doc.setFont("helvetica", "normal")
      doc.text(demande.etudiant?.nom_mere || "Non renseigné", rightColX + 45, infoStartY + 21)

      // === DOCUMENTS TABLE ===
      const tableY = sectionY + 75
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("DOCUMENTS DEMANDÉS", margin, tableY)

      const tableData = demande.documents.map((doc, index) => [
        { content: doc.type_document.libelle, styles: { fontStyle: 'bold' as const } },
        doc.niveau || "-",
        doc.annee_universitaire || "-",
        { content: `${doc.prix} Ar`, styles: { fontStyle: 'bold' as const, textColor: [79, 70, 229] as [number, number, number] } }
      ])

      autoTable(doc, {
        startY: tableY + 5,
        margin: { left: margin, right: margin },
        head: [[
          { content: "Type de document", styles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' as const } },
          { content: "Niveau", styles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' as const } },
          { content: "Année Univ.", styles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' as const } },
          { content: "Prix", styles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' as const } }
        ]],
        body: tableData,
        foot: [[
          { content: "TOTAL À PAYER:", colSpan: 3, styles: { fillColor: [249, 250, 251], textColor: [30, 41, 59], fontStyle: 'bold' as const, fontSize: 12, halign: 'right' } },
          { content: `${demande.montant_total} Ar`, styles: { fillColor: [249, 250, 251], textColor: [79, 70, 229], fontStyle: 'bold' as const, fontSize: 12, halign: 'right' } }
        ]],
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 6,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
          textColor: [71, 85, 105]
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: 'bold' as const,
          lineWidth: 0
        },
        footStyles: {
          fillColor: [249, 250, 251],
          textColor: [30, 41, 59],
          fontStyle: 'bold' as const,
          lineWidth: 0.5
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 40, halign: 'right' }
        }
      })

      const finalY = (doc as any).lastAutoTable.finalY + 20

      // Footer
      const footerY = pageHeight - 15
      doc.setDrawColor(226, 232, 240)
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.setFont("helvetica", "normal")
      doc.text("Ce ticket est valable uniquement pour la demande concernée", pageWidth / 2, footerY, { align: "center" })
      doc.text(`ID de suivi: ${demande.id}-${Date.now().toString(36).toUpperCase()}`, pageWidth / 2, footerY + 4, { align: "center" })

      // Filigrane de sécurité
      doc.setTextColor(226, 232, 240)
      doc.setFontSize(40)
      doc.setFont("helvetica", "bold")
      doc.text("VALIDE", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45
      })

      // Sauvegarde
      doc.save(`Ticket_${demande.etudiant?.matricule || demande.id}_${new Date().toISOString().split('T')[0]}.pdf`)

    } catch (error) {
      console.error("Erreur génération PDF:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le ticket",
      })
    }
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
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer" onClick={handleDownloadTicket}>
            <Download className="h-4 w-4" />
            Télécharger le ticket
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
                    <div className="w-full">
                      <h4 className="font-semibold text-green-800 mb-1">Documents prêts !</h4>
                      <p className="text-green-700 mb-3">
                        Vos documents sont disponibles au service de scolarité.
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Section ENI Fianarantsoa */}
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <h5 className="font-semibold text-green-800">ENI Fianarantsoa</h5>
                          </div>
                          <div className="space-y-2 text-green-700">
                            <div className="flex items-start gap-2">
                              <span className="text-green-600">📍</span>
                              <div>
                                <strong>Lieu :</strong> Tanambao Antaninarenina
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-green-600">🕒</span>
                              <div>
                                <strong>Horaires :</strong> Lundi au vendredi, 8h-12h et 14h-17h
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-green-600">📋</span>
                              <div>
                                <strong>À apporter :</strong> Carte d'étudiant, pièce d'identité et le montant à payer
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section ENI Toliara */}
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                            <h5 className="font-semibold text-green-800">ENI Toliara</h5>
                          </div>
                          <div className="space-y-2 text-green-700">
                            <div className="flex items-start gap-2">
                              <span className="text-green-600">📍</span>
                              <div>
                                <strong>Lieu :</strong> Bureau scolarité - Maninday
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-green-600">🕒</span>
                              <div>
                                <strong>Horaires :</strong> Lundi au vendredi, 8h-12h et 14h-17h
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-green-600">📋</span>
                              <div>
                                <strong>À apporter :</strong> Carte d'étudiant, pièce d'identité et le montant à payer
                              </div>
                            </div>
                          </div>
                        </div>
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