"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, LogOut, Send } from "lucide-react"
import { criarSolicitacao, buscarSolicitacoesPaciente } from "@/lib/supabase-client"

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: string
}

interface Solicitacao {
  id: string
  descricao: string
  status: string
  created_at: string
}

interface Props {
  user: Usuario
  initialSolicitacoes: Solicitacao[]
}

export default function DashboardPacienteClient({ user, initialSolicitacoes }: Props) {
  const router = useRouter()
  const [solicitacoes, setSolicitacoes] = useState(initialSolicitacoes)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const descricao = formData.get("descricao") as string
    if (!descricao.trim()) return

    setLoading(true)
    try {
      const novaSolicitacao = await criarSolicitacao(user.id, descricao)
      setSolicitacoes([novaSolicitacao, ...solicitacoes])
      setMessage("Solicitação enviada com sucesso!")
      // Reset form
      event.currentTarget.reset()
    } catch (error) {
      setMessage("Erro ao enviar solicitação")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      const fetchedSolicitacoes = await buscarSolicitacoesPaciente(user.id)
      setSolicitacoes(fetchedSolicitacoes)
    }

    fetchSolicitacoes()
  }, [user.id])

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
              <p className="text-sm text-gray-600">Olá, {user.nome}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
        <p className="text-xs text-blue-700">Sistema: Supabase Conectado ✅ | {solicitacoes.length} solicitações</p>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Formulário de Solicitação */}
        <div className="border border-green-100 rounded-lg bg-white shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Nova Solicitação</h2>

          {message && (
            <div
              className={`px-4 py-3 rounded mb-4 ${message.includes("sucesso") ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <textarea
              name="descricao"
              placeholder="Descreva seus sintomas..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Enviando..." : "Enviar Solicitação"}
            </button>
          </form>
        </div>

        {/* Minhas Solicitações */}
        <div className="border border-green-100 rounded-lg bg-white shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Minhas Solicitações ({solicitacoes.length})</h2>
          {solicitacoes.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Nenhuma solicitação ainda</p>
          ) : (
            <div className="space-y-3">
              {solicitacoes.map((sol) => (
                <div key={sol.id} className="border border-green-100 rounded-lg p-4">
                  <p className="text-sm text-gray-900 mb-2">{sol.descricao}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{new Date(sol.created_at).toLocaleString("pt-BR")}</span>
                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">{sol.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
