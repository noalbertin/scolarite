"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      matricule: formData.get("matricule"),
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      date_naissance: formData.get("date_naissance"),
      lieu_naissance: formData.get("lieu_naissance"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      password: formData.get("password"),
      nom_pere: formData.get("nom_pere"),
      nom_mere: formData.get("nom_mere"),
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Erreur lors de l'inscription")
        return
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      })

      router.push("/auth/login")
    } catch (err) {
      setError("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-secondary/20 to-background py-12 px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">Scolarité</span>
          </Link>
          <p className="text-sm text-muted-foreground">Gestion de Documents</p>
        </div>

        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Créer un compte étudiant
            </CardTitle>
            <CardDescription className="text-gray-600">
              Remplissez le formulaire pour créer votre compte et accéder aux services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="matricule" className="text-sm font-medium">
                    Matricule <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="matricule"
                    name="matricule"
                    placeholder="XXX H-TOL"
                    required
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@exemple.mg"
                    required
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="nom" className="text-sm font-medium">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    placeholder="Rakoto"
                    required
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="prenom" className="text-sm font-medium">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    placeholder="Jean"
                    required
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="date_naissance" className="text-sm font-medium">
                    Date de naissance <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date_naissance"
                    name="date_naissance"
                    type="date"
                    required
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lieu_naissance" className="text-sm font-medium">
                    Lieu de naissance
                  </Label>
                  <Input
                    id="lieu_naissance"
                    name="lieu_naissance"
                    placeholder="Antananarivo"
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="telephone" className="text-sm font-medium">
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    placeholder="034 12 345 67"
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="focus:ring-2 focus:ring-primary/20 border-gray-300 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors cursor-pointer"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères avec lettres et chiffres</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="nom_pere" className="text-sm font-medium">
                    Nom du père
                  </Label>
                  <Input
                    id="nom_pere"
                    name="nom_pere"
                    placeholder="Nom du père"
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="nom_mere" className="text-sm font-medium">
                    Nom de la mère
                  </Label>
                  <Input
                    id="nom_mere"
                    name="nom_mere"
                    placeholder="Nom de la mère"
                    className="focus:ring-2 focus:ring-primary/20 border-gray-300"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium py-6 text-base cursor-pointer transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Inscription en cours...
                    </span>
                  ) : (
                    "Créer mon compte"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-semibold hover:underline cursor-pointer transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Scolarité - Gestion de Documents. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}