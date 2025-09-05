"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Heart } from "lucide-react"

export default function CompleteSignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const userParam = searchParams.get("user")

    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam))

        // Salvar no localStorage
        const existingUsers = JSON.parse(localStorage.getItem("medicina_usuarios") || "[]")

        // Verificar se já existe
        const userExists = existingUsers.find((u: any) => u.email === userData.email)

        if (!userExists) {
          existingUsers.push(userData)
          localStorage.setItem("medicina_usuarios", JSON.stringify(existingUsers))
        }

        // Redirecionar após 2 segundos
        setTimeout(() => {
          const loginPath = userData.tipo === "paciente" ? "/login/paciente" : "/login/medico"
          router.push(`${loginPath}?success=Cadastro realizado com sucesso!`)
        }, 2000)
      } catch (error) {
        console.error("Erro ao processar cadastro:", error)
        router.push("/")
      }
    } else {
      router.push("/")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="max-w-sm mx-auto px-4">
        <Card className="border-green-100">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-8 w-8 text-primary fill-primary" />
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-primary">Cadastro Realizado!</CardTitle>
            <CardDescription>Sua conta foi criada com sucesso. Redirecionando para o login...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">Aguarde um momento...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
