import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GraduationCap, Shield, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="hidden lg:flex items-center gap-2">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center">
                {/* Using img tag as in user request, assuming icon.png exists in public */}
                <img src="/icon.png" alt="" sizes="16" />
              </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Scolarité
            </span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" >
              <Button className="cursor-pointer" variant="ghost">Connexion</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="cursor-pointer">Inscription</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Demandez vos documents administratifs en ligne
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Plateforme moderne et sécurisée pour la gestion de vos attestations, relevés de notes et certificats de
            scolarité
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg cursor-pointer">
                Commencer maintenant
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg bg-transparent cursor-pointer">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Documents variés</CardTitle>
              <CardDescription>
                Relevés de notes, attestations, certificats de scolarité disponibles en quelques clics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Shield className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Sécurisé et fiable</CardTitle>
              <CardDescription>Vos données sont protégées avec des standards de sécurité élevés</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-success transition-colors">
            <CardHeader>
              <CheckCircle2 className="h-12 w-12 text-success mb-4" />
              <CardTitle>Suivi en temps réel</CardTitle>
              <CardDescription>Recevez des notifications à chaque étape du traitement de votre demande</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Documents disponibles */}
      <section className="container mx-auto px-4 py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Documents disponibles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relevé de notes</CardTitle>
                <CardDescription className="text-lg font-semibold text-primary">2 000 Ar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Disponible pour chaque niveau et année universitaire selon votre parcours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificat de scolarité</CardTitle>
                <CardDescription className="text-lg font-semibold text-primary">2 000 Ar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Avec nom des parents, pour justifier votre inscription</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attestation de réussite</CardTitle>
                <CardDescription className="text-lg font-semibold text-accent">3 000 Ar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Disponible pour L3 et M2 uniquement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Autres attestations</CardTitle>
                <CardDescription className="text-lg font-semibold text-accent">3 000 Ar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Inscription, fin d'études, apprentissage du français, fin de formation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Scolarité - Gestion de Documents Administratifs</p>
        </div>
      </footer>
    </div>
  )
}
