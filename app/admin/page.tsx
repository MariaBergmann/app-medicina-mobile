"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Plus, Trash2, MapPin, Users, CheckCircle, Settings } from "lucide-react"

interface RegiaoElegivel {
  id: string
  nome: string
  estado: string
  criterios: string
  ativa: boolean
  criadaEm: Date
  criadaPor: string
}

interface EstatisticasAdmin {
  regioesCadastradas: number
  pacientesElegiveis: number
  solicitacoesPendentes: number
  medicosAtivos: number
}

export default function AdminPage() {
  const router = useRouter()
  const [regioes, setRegioes] = useState<RegiaoElegivel[]>([])
  const [novaRegiao, setNovaRegiao] = useState({
    nome: "",
    estado: "",
    criterios: "",
  })
  const [estatisticas, setEstatisticas] = useState<EstatisticasAdmin>({
    regioesCadastradas: 0,
    pacientesElegiveis: 0,
    solicitacoesPendentes: 0,
    medicosAtivos: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const estados = [
    "Acre",
    "Alagoas",
    "Amapá",
    "Amazonas",
    "Bahia",
    "Ceará",
    "Distrito Federal",
    "Espírito Santo",
    "Goiás",
    "Maranhão",
    "Mato Grosso",
    "Mato Grosso do Sul",
    "Minas Gerais",
    "Pará",
    "Paraíba",
    "Paraná",
    "Pernambuco",
    "Piauí",
    "Rio de Janeiro",
    "Rio Grande do Norte",
    "Rio Grande do Sul",
    "Rondônia",
    "Roraima",
    "Santa Catarina",
    "São Paulo",
    "Sergipe",
    "Tocantins",
  ]

  // Mock data para demonstração
  useEffect(() => {
    const regioesMock: RegiaoElegivel[] = [
      {
        id: "1",
        nome: "Interior de São Paulo",
        estado: "São Paulo",
        criterios: "Municípios com menos de 50.000 habitantes e distância superior a 100km da capital",
        ativa: true,
        criadaEm: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        criadaPor: "Prefeitura de São Paulo",
      },
      {
        id: "2",
        nome: "Zona Rural - Bahia",
        estado: "Bahia",
        criterios: "Comunidades rurais sem acesso a unidades básicas de saúde em raio de 50km",
        ativa: true,
        criadaEm: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        criadaPor: "Governo do Estado da Bahia",
      },
      {
        id: "3",
        nome: "Amazônia - Acre",
        estado: "Acre",
        criterios: "Comunidades ribeirinhas e indígenas com acesso limitado a transporte",
        ativa: true,
        criadaEm: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        criadaPor: "Secretaria de Saúde do Acre",
      },
    ]

    setRegioes(regioesMock)
    setEstatisticas({
      regioesCadastradas: regioesMock.length,
      pacientesElegiveis: 1247,
      solicitacoesPendentes: 23,
      medicosAtivos: 89,
    })
  }, [])

  const handleAdicionarRegiao = async () => {
    if (!novaRegiao.nome || !novaRegiao.estado || !novaRegiao.criterios) return

    setIsLoading(true)

    const regiao: RegiaoElegivel = {
      id: Date.now().toString(),
      nome: novaRegiao.nome,
      estado: novaRegiao.estado,
      criterios: novaRegiao.criterios,
      ativa: true,
      criadaEm: new Date(),
      criadaPor: "Administrador Atual",
    }

    setRegioes((prev) => [regiao, ...prev])
    setNovaRegiao({ nome: "", estado: "", criterios: "" })
    setEstatisticas((prev) => ({ ...prev, regioesCadastradas: prev.regioesCadastradas + 1 }))
    setIsLoading(false)
  }

  const handleRemoverRegiao = (id: string) => {
    setRegioes((prev) => prev.filter((r) => r.id !== id))
    setEstatisticas((prev) => ({ ...prev, regioesCadastradas: prev.regioesCadastradas - 1 }))
  }

  const toggleRegiaoAtiva = (id: string) => {
    setRegioes((prev) => prev.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="px-4 py-6 border-b border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <div>
              <h1 className="text-lg font-bold text-primary">Médicos para Todos</h1>
              <p className="text-sm text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/")} className="bg-transparent">
            Voltar ao App
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-green-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.regioesCadastradas}</div>
              <div className="text-xs text-muted-foreground">Regiões Cadastradas</div>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.pacientesElegiveis}</div>
              <div className="text-xs text-muted-foreground">Pacientes Elegíveis</div>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.solicitacoesPendentes}</div>
              <div className="text-xs text-muted-foreground">Solicitações Pendentes</div>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.medicosAtivos}</div>
              <div className="text-xs text-muted-foreground">Médicos Ativos</div>
            </CardContent>
          </Card>
        </div>

        {/* Adicionar Nova Região */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Adicionar Nova Região Elegível
            </CardTitle>
            <CardDescription>
              Defina uma nova região de difícil acesso que será elegível para os serviços gratuitos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Região</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Interior de São Paulo"
                  value={novaRegiao.nome}
                  onChange={(e) => setNovaRegiao((prev) => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select onValueChange={(value) => setNovaRegiao((prev) => ({ ...prev, estado: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterios">Critérios de Elegibilidade</Label>
              <Textarea
                id="criterios"
                placeholder="Descreva os critérios que definem esta região como de difícil acesso..."
                value={novaRegiao.criterios}
                onChange={(e) => setNovaRegiao((prev) => ({ ...prev, criterios: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            <Button onClick={handleAdicionarRegiao} disabled={isLoading} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Adicionando..." : "Adicionar Região"}
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Regiões */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Regiões Elegíveis Cadastradas ({regioes.length})
            </CardTitle>
            <CardDescription>Gerencie as regiões que têm acesso aos serviços gratuitos</CardDescription>
          </CardHeader>
          <CardContent>
            {regioes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma região cadastrada ainda</p>
            ) : (
              <div className="space-y-4">
                {regioes.map((regiao) => (
                  <div key={regiao.id} className="border border-green-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{regiao.nome}</h3>
                          <Badge variant="outline" className="text-xs">
                            {regiao.estado}
                          </Badge>
                          <Badge className={regiao.ativa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {regiao.ativa ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{regiao.criterios}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Criada em: {regiao.criadaEm.toLocaleDateString("pt-BR")}</span>
                          <span>Por: {regiao.criadaPor}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleRegiaoAtiva(regiao.id)}
                          className="bg-transparent"
                        >
                          {regiao.ativa ? <Settings className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoverRegiao(regiao.id)}
                          className="bg-transparent border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Sobre o Sistema de Elegibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Como funciona:</strong> Pacientes que se cadastram têm sua região verificada automaticamente
              contra as regiões elegíveis cadastradas aqui.
            </p>
            <p>
              <strong>Validação:</strong> O sistema verifica se a região informada pelo paciente corresponde a alguma
              das regiões elegíveis ativas.
            </p>
            <p>
              <strong>Acesso:</strong> Apenas pacientes de regiões elegíveis podem acessar os serviços médicos gratuitos
              da plataforma.
            </p>
            <p>
              <strong>Gestão:</strong> Empresas e prefeituras podem adicionar, editar ou desativar regiões conforme
              necessário.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
