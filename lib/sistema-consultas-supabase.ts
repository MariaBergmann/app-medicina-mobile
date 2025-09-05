import { supabase, isSupabaseConfigured } from "./supabase/client"
import { sistemaConsultas as sistemaLocal } from "./sistema-consultas-local"

export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: "paciente" | "medico"
  regiao: string
  idade?: number
  crm?: string
  especialidade?: string
  created_at?: string
  updated_at?: string
}

export interface Solicitacao {
  id: string
  paciente_id: string
  medico_id?: string
  descricao: string
  status: "nova" | "aceita" | "em_andamento" | "finalizada"
  prioridade: "baixa" | "media" | "alta"
  created_at: string
  aceita_em?: string
  iniciada_em?: string
  finalizada_em?: string
  arquivos?: Array<{
    id: string
    nome: string
    tipo: string
    dados: string
  }>
}

export const sistemaConsultasSupabase = {
  // Usuários
  async criarUsuario(usuario: Omit<Usuario, "id" | "created_at" | "updated_at">): Promise<Usuario> {
    if (!isSupabaseConfigured || !supabase) {
      console.log("Supabase não configurado, usando localStorage")
      return sistemaLocal.criarUsuario(usuario)
    }

    try {
      console.log("Tentando criar usuário no Supabase:", usuario.email)
      const { data, error } = await supabase.from("usuarios").insert([usuario]).select().single()

      if (error) {
        console.error("Erro do Supabase ao criar usuário:", error)
        throw error
      }

      console.log("Usuário criado com sucesso no Supabase:", data.id)
      return data
    } catch (error) {
      console.error("Erro ao criar usuário no Supabase, usando fallback:", error)
      return sistemaLocal.criarUsuario(usuario)
    }
  },

  async obterUsuario(email: string): Promise<Usuario | null> {
    if (!isSupabaseConfigured || !supabase) {
      console.log("Supabase não configurado, usando localStorage")
      return sistemaLocal.obterUsuario(email)
    }

    try {
      console.log("Buscando usuário no Supabase:", email)
      const { data, error } = await supabase.from("usuarios").select("*").eq("email", email).single()

      if (error) {
        if (error.code === "PGRST116") {
          // Usuário não encontrado - isso é normal
          console.log("Usuário não encontrado no Supabase")
          return null
        }
        throw error
      }

      console.log("Usuário encontrado no Supabase:", data.id)
      return data
    } catch (error) {
      console.error("Erro ao obter usuário do Supabase, usando fallback:", error)
      return sistemaLocal.obterUsuario(email)
    }
  },

  // Solicitações
  async criarSolicitacao(solicitacao: Omit<Solicitacao, "id" | "created_at">): Promise<Solicitacao> {
    if (!isSupabaseConfigured || !supabase) {
      console.log("Supabase não configurado, usando localStorage")
      return sistemaLocal.criarSolicitacao(solicitacao)
    }

    try {
      console.log("Criando solicitação no Supabase")
      const { data, error } = await supabase
        .from("solicitacoes")
        .insert([
          {
            paciente_id: solicitacao.paciente_id,
            descricao: solicitacao.descricao,
            status: solicitacao.status,
            prioridade: solicitacao.prioridade,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Erro do Supabase ao criar solicitação:", error)
        throw error
      }

      console.log("Solicitação criada com sucesso no Supabase:", data.id)

      // Salvar arquivos se existirem
      if (solicitacao.arquivos && solicitacao.arquivos.length > 0) {
        const arquivosData = solicitacao.arquivos.map((arquivo) => ({
          solicitacao_id: data.id,
          nome: arquivo.nome,
          tipo: arquivo.tipo,
          dados: arquivo.dados,
        }))

        const { error: arquivosError } = await supabase.from("arquivos_solicitacao").insert(arquivosData)
        if (arquivosError) {
          console.error("Erro ao salvar arquivos:", arquivosError)
        }
      }

      return { ...data, arquivos: solicitacao.arquivos }
    } catch (error) {
      console.error("Erro ao criar solicitação no Supabase, usando fallback:", error)
      return sistemaLocal.criarSolicitacao(solicitacao)
    }
  },

  async obterSolicitacoes(): Promise<Solicitacao[]> {
    if (!isSupabaseConfigured || !supabase) {
      return sistemaLocal.obterSolicitacoes()
    }

    try {
      const { data: solicitacoes, error } = await supabase
        .from("solicitacoes")
        .select(`
          *,
          arquivos_solicitacao (
            id,
            nome,
            tipo,
            dados
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      return solicitacoes.map((sol) => ({
        ...sol,
        arquivos: sol.arquivos_solicitacao || [],
      }))
    } catch (error) {
      console.error("Erro ao obter solicitações do Supabase:", error)
      return sistemaLocal.obterSolicitacoes()
    }
  },

  async atualizarSolicitacao(id: string, updates: Partial<Solicitacao>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return sistemaLocal.atualizarSolicitacao(id, updates)
    }

    try {
      const { error } = await supabase.from("solicitacoes").update(updates).eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Erro ao atualizar solicitação no Supabase:", error)
      return sistemaLocal.atualizarSolicitacao(id, updates)
    }
  },

  async obterSolicitacoesPorPaciente(pacienteId: string): Promise<Solicitacao[]> {
    if (!isSupabaseConfigured || !supabase) {
      return sistemaLocal.obterSolicitacoesPorPaciente(pacienteId)
    }

    try {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select(`
          *,
          arquivos_solicitacao (
            id,
            nome,
            tipo,
            dados
          )
        `)
        .eq("paciente_id", pacienteId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data.map((sol) => ({
        ...sol,
        arquivos: sol.arquivos_solicitacao || [],
      }))
    } catch (error) {
      console.error("Erro ao obter solicitações do paciente:", error)
      return sistemaLocal.obterSolicitacoesPorPaciente(pacienteId)
    }
  },

  async obterSolicitacoesDisponiveis(): Promise<Solicitacao[]> {
    if (!isSupabaseConfigured || !supabase) {
      return sistemaLocal.obterSolicitacoesDisponiveis()
    }

    try {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select(`
          *,
          arquivos_solicitacao (
            id,
            nome,
            tipo,
            dados
          )
        `)
        .eq("status", "nova")
        .order("created_at", { ascending: false })

      if (error) throw error

      return data.map((sol) => ({
        ...sol,
        arquivos: sol.arquivos_solicitacao || [],
      }))
    } catch (error) {
      console.error("Erro ao obter solicitações disponíveis:", error)
      return sistemaLocal.obterSolicitacoesDisponiveis()
    }
  },
}
