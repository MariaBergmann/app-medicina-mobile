"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
// Importando server action do Supabase em vez do hook use-auth
import { createUser } from "@/app/actions/userActions"
import { verificarElegibilidade, obterSugestoesRegioes } from "@/lib/elegibilidade"
import Link from "next/link"

export default function CadastroPacientePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    telefone: "",
    endereco: "",
    regiao: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [elegibilidade, setElegibilidade] = useState<{
    verificada: boolean
    elegivel: boolean
    regiaoEncontrada?: any
    motivo?: string
  }>({
    verificada: false,
    elegivel: false,
  })

  const router = useRouter()
  const sugestoesRegioes = obterSugestoesRegioes()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    // Verificar elegibilidade antes de criar a conta
    const resultadoElegibilidade = verificarElegibilidade(formData.regiao)

    if (!resultadoElegibilidade.elegivel) {
      setError(
        `Região não elegível: ${resultadoElegibilidade.motivo}. Consulte o administrador do sistema para mais informações.`,
      )
      setIsLoading(false)
      return
    }

    try {
      const user = await createUser(formData.email, formData.password)

      if (user) {
        router.push("/dashboard/paciente")
      }
    } catch (error: any) {
      setError(error.message || "Erro ao criar conta. Tente novamente.")
    }

    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Verificar elegibilidade em tempo real quando a região for alterada
    if (field === "regiao" && value.trim().length > 3) {
      const resultado = verificarElegibilidade(value)
      setElegibilidade({
        verificada: true,
        elegivel: resultado.elegivel,
        regiaoEncontrada: resultado.regiaoEncontrada,
        motivo: resultado.motivo,
      })
    } else if (field === "regiao") {
      setElegibilidade({ verificada: false, elegivel: false })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <h1 className="text-lg font-bold text-primary">Médicos para Todos</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-8">
        <div className="max-w-sm mx-auto">
          <Card className="border-green-100">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-primary">Cadastro do Paciente</CardTitle>
              <CardDescription>Crie sua conta para acessar atendimento médico gratuito</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    type="text"
                    placeholder="Rua, número, bairro"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regiao">Região *</Label>
                  <Input
                    id="regiao"
                    name="regiao"
                    type="text"
                    placeholder="Ex: Interior de São Paulo"
                    value={formData.regiao}
                    onChange={(e) => handleInputChange("regiao", e.target.value)}
                    required
                  />
                  {elegibilidade.verificada && (
                    <div className="mt-2">
                      {elegibilidade.elegivel ? (
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm text-green-800 font-medium">Região elegível!</p>
                            {elegibilidade.regiaoEncontrada && (
                              <p className="text-xs text-green-600">
                                Corresponde a: {elegibilidade.regiaoEncontrada.nome}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="text-sm text-red-800 font-medium">Região não elegível</p>
                            <p className="text-xs text-red-600">{elegibilidade.motivo}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {sugestoesRegioes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Regiões elegíveis:</p>
                      <div className="flex flex-wrap gap-1">
                        {sugestoesRegioes.slice(0, 3).map((regiao) => (
                          <Badge
                            key={regiao}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-green-50"
                            onClick={() => handleInputChange("regiao", regiao)}
                          >
                            {regiao}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link href="/login/paciente" className="text-primary hover:underline font-medium">
                    Faça login aqui
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  * Apenas regiões de difícil acesso são elegíveis para o atendimento gratuito
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
