"use client"

import { useState, useEffect } from "react"
import { Heart, LogOut, CheckCircle, User } from "lucide-react"
import { buscarTodasSolicitacoes, aceitarSolicitacao } from "@/lib/supabase-client"
import Link from "next/link"

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: string
}

interface Solicitacao {
  id: string
  paciente_id: string
  descricao: string
  status: string
  created_at: string
  usuarios: { nome: string }
}

interface Props {
  user: Usuario
  initialSolicitacoes: Solicitacao[]
}

export default function DashboardMedicoClient({ user, initialSolicitacoes }: Props) {
  const [disponivel, setDisponivel] = useState(true)
  const [solicitacoes, setSolicitacoes] = useState(initialSolicitacoes)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const novasSolicitacoes = await buscarTodasSolicitacoes()
        setSolicitacoes(novasSolicitacoes)
      } catch (error) {
        console.error("Erro ao buscar solicitações:", error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleAceitarSolicitacao = async (solicitacaoId: string) => {
    setLoading(true)
    try {
      await aceitarSolicitacao(solicitacaoId, user.id)
      setSolicitacoes(solicitacoes.filter((s) => s.id !== solicitacaoId))
    } catch (error) {
      console.error("Erro ao aceitar solicitação:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="px-4 py-6 border-b border-green-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-green-600 fill-green-600" />
            <div>
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-lg font-bold text-green-600">Médicos para Todos</h1>
              </Link>
              <p className="text-sm text-gray-600">Dr(a). {user.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={disponivel}
                onChange={(e) => setDisponivel(e.target.checked)}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm">{disponivel ? "Disponível" : "Indisponível"}</span>
            </label>
            <button onClick={handleLogout} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
        <p className="text-xs text-blue-700">
          Sistema: Supabase Conectado ✅ | {solicitacoes.length} solicitações disponíveis
        </p>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Novas Solicitações */}
        <div className="border border-green-100 rounded-lg bg-white shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Novas Solicitações ({solicitacoes.length})</h2>
          <p className="text-xs text-gray-600 mb-4">Pacientes aguardando atendimento</p>

          {solicitacoes.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma solicitação pendente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoes.map((solicitacao) => (
                <div key={solicitacao.id} className="border border-green-100 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{solicitacao.usuarios.nome}</p>
                        <p className="text-xs text-gray-600">
                          {Math.floor((Date.now() - new Date(solicitacao.created_at).getTime()) / 60000)} min atrás
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mb-3">{solicitacao.descricao}</p>

                  <button
                    onClick={() => handleAceitarSolicitacao(solicitacao.id)}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {loading ? "Aceitando..." : "Aceitar Solicitação"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
