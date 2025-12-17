"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TypeDocument {
  id: number
  code: string
  libelle: string
  prix: number
  necessite_niveau: boolean
  niveaux_autorises: string | null
}

interface DocumentSelection {
  type_document_id: number
  niveau?: string
  annee_universitaire?: string
}

export default function NouvelleDemandePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [typesDocuments, setTypesDocuments] = useState<TypeDocument[]>([])
  const [selections, setSelections] = useState<DocumentSelection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchTypesDocuments(token)
  }, [])

  const fetchTypesDocuments = async (token: string) => {
    try {
      const response = await fetch("/api/types-documents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setTypesDocuments(data.types || [])
      }
    } catch (error) {
      console.error("Erreur chargement types documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (typeId: number, checked: boolean) => {
    if (checked) {
      setSelections([...selections, { type_document_id: typeId }])
    } else {
      setSelections(selections.filter((s) => s.type_document_id !== typeId))
    }
  }

  const updateSelection = (typeId: number, field: "niveau" | "annee_universitaire", value: string) => {
    setSelections(selections.map((s) => (s.type_document_id === typeId ? { ...s, [field]: value } : s)))
  }

  const calculateTotal = () => {
    return selections.reduce((total, selection) => {
      const typeDoc = typesDocuments.find((t) => t.id === selection.type_document_id)
      return total + (typeDoc?.prix || 0)
    }, 0)
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    if (selections.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un document",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/demandes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documents: selections }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Demande créée",
          description: "Votre demande a été soumise avec succès",
        })
        router.push("/etudiant/dashboard")
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la création",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i
    return `${year}-${year + 1}`
  })

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nouvelle demande</h1>
        <p className="text-muted-foreground">Sélectionnez les documents dont vous avez besoin</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Documents disponibles</CardTitle>
          <CardDescription>Cochez les documents que vous souhaitez demander</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Chargement...</p>
          ) : (
            <div className="space-y-6">
              {typesDocuments.map((typeDoc) => {
                const isSelected = selections.some((s) => s.type_document_id === typeDoc.id)
                const selection = selections.find((s) => s.type_document_id === typeDoc.id)

                return (
                  <div key={typeDoc.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id={`doc-${typeDoc.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleCheckboxChange(typeDoc.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`doc-${typeDoc.id}`} className="text-base font-semibold cursor-pointer">
                          {typeDoc.libelle}
                        </Label>
                        <p className="text-sm text-primary font-semibold mt-1">{typeDoc.prix.toLocaleString()} Ar</p>
                      </div>
                    </div>

                    {isSelected && typeDoc.necessite_niveau && (
                      <div className="ml-8 grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Niveau</Label>
                          <Select
                            value={selection?.niveau}
                            onValueChange={(value) => updateSelection(typeDoc.id, "niveau", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="L1">L1</SelectItem>
                              <SelectItem value="L2">L2</SelectItem>
                              <SelectItem value="L3">L3</SelectItem>
                              <SelectItem value="M1">M1</SelectItem>
                              <SelectItem value="M2">M2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Année universitaire</Label>
                          <Select
                            value={selection?.annee_universitaire}
                            onValueChange={(value) => updateSelection(typeDoc.id, "annee_universitaire", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Récapitulatif */}
      {selections.length > 0 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium">Nombre de documents</span>
                <span className="font-bold">{selections.length}</span>
              </div>
              <div className="flex items-center justify-between text-xl border-t pt-4">
                <span className="font-bold">Montant total</span>
                <span className="font-bold text-primary">{calculateTotal().toLocaleString()} Ar</span>
              </div>
              <Button onClick={handleSubmit} className="w-full cursor-pointer" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Soumettre la demande
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
