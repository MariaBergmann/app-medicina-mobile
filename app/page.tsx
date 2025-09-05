"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, MapPin, Clock, Star, Stethoscope } from "lucide-react"
import { useRouter } from "next/navigation"
import { PWAInstall } from "@/components/pwa-install"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-8 text-center bg-gradient-to-b from-card to-background">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Heart className="h-10 w-10 text-primary fill-primary" />
          <h1 className="text-3xl font-black text-primary">Médicos para Todos</h1>
        </div>
        <p className="text-muted-foreground text-base font-medium">Conectando você à saúde</p>
      </header>

      <main className="px-6 pb-12">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="mb-8 relative">
            <div className="w-80 h-56 mx-auto rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/telemedicine-consultation.png"
                alt="Telemedicina - Paciente conversando com médico através do smartphone"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-2xl font-black mb-4 text-foreground">Médicos voluntários ao alcance de um toque</h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-8">
            Estamos aqui para cuidar de você. Conectamos pessoas em regiões de difícil acesso com médicos voluntários
            qualificados. Atendimento gratuito e de qualidade, onde você estiver.
          </p>
        </div>

        <div className="grid gap-6 mb-12 max-w-lg mx-auto">
          <Card className="border-primary/20 bg-card/50 hover:bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">Médicos voluntários</h3>
                <p className="text-sm text-muted-foreground">Profissionais qualificados</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-card/50 hover:bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">Regiões remotas</h3>
                <p className="text-sm text-muted-foreground">Atendimento onde você precisa</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 hover:bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">Disponível 24h</h3>
                <p className="text-sm text-muted-foreground">Suporte quando você precisar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 max-w-sm mx-auto mb-12">
          <Button
            className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            onClick={() => router.push("/login/paciente")}
          >
            <Users className="h-5 w-5 mr-2" />
            Entrar como Paciente
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 text-lg font-bold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all duration-300 transform hover:scale-[1.02] bg-transparent"
            onClick={() => router.push("/login/medico")}
          >
            <Stethoscope className="h-5 w-5 mr-2" />
            Entrar como Médico
          </Button>
        </div>

        <div className="text-center bg-card/30 rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="h-5 w-5 text-accent fill-accent" />
            <h3 className="font-bold text-base">Navegar é fácil!</h3>
            <Star className="h-5 w-5 text-accent fill-accent" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">Toque nos botões para começar.</p>
          <p className="text-sm text-muted-foreground">Precisa de ajuda? Entre em contato conosco.</p>
        </div>
      </main>

      <PWAInstall />
    </div>
  )
}
