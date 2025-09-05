import { supabase, isSupabaseConfigured } from "./supabase/client"
import { sistemaConsultas as sistemaLocal } from "./sistema-consultas"
import type { SolicitacaoGlobal } from "./sistema-consultas"

interface SolicitacaoSimples {
  id: string
  paciente_id: string
  descricao: string
  status: string
  created_at: string
}

class SistemaConsultasHibrido {
  private static instance: SistemaConsultasHibrido
  private useSupabase = isSupabaseConfigured // Usar configuração do cliente

  static getInstance(): SistemaConsultasHibrido {
    if (!SistemaConsultasHibrido.instance) {
      SistemaConsultasHibrido.instance = new SistemaConsultasHibrido()
    }
    return SistemaConsultasHibrido.instance
  }

  getStatusSistema(): string {
    return this.useSupabase ? "🟢 Supabase (nuvem)" : "🟡 localStorage (local)"
  }

  async criarSolicitacao(solicitacao: Omit<SolicitacaoGlobal, "id" | "criadaEm">): Promise<SolicitacaoGlobal> {
    if (this.useSupabase) {
      try {
        // Tentar Supabase primeiro
        const { data, error } = await supabase
          .from("solicitacoes")
          .insert({
            paciente_id: solicitacao.pacienteId,
            descricao: solicitacao.descricao,
            prioridade: solicitacao.prioridade,
            status: solicitacao.status,
          })
          .select()
          .single()

        if (!error && data) {
          // Salvar arquivos se existirem
          if (solicitacao.arquivos && solicitacao.arquivos.length > 0) {
            await this.salvarArquivosSupabase(data.id, solicitacao.arquivos)
          }

          return this.converterSupabaseParaLocal(data)
        }
      } catch (error) {
        console.log("Supabase indisponível, usando localStorage:", error)
        this.useSupabase = false
      }
    }

    // Fallback para localStorage
    return sistemaLocal.criarSolicitacao(solicitacao)
  }

  async criarSolicitacaoDashboard(dados: {
    paciente_id: string
    descricao: string
    status: string
    prioridade: string
  }): Promise<SolicitacaoSimples> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from("solicitacoes")
          .insert({
            paciente_id: dados.paciente_id,
            descricao: dados.descricao,
            prioridade: dados.prioridade,
            status: dados.status,
          })
          .select()
          .single()

        if (!error && data) {
          return {
            id: data.id,
            paciente_id: data.paciente_id,
            descricao: data.descricao,
            status: data.status,
            created_at: data.created_at,
          }
        }
      } catch (error) {
        console.log("Supabase indisponível, usando localStorage:", error)
        this.useSupabase = false
      }
    }

    // Fallback para localStorage
    const id = `sol-${Date.now()}`
    const solicitacao = {
      id,
      paciente_id: dados.paciente_id,
      descricao: dados.descricao,
      status: dados.status,
      created_at: new Date().toISOString(),
    }

    const globalSolicitacoes = JSON.parse(localStorage.getItem("medicina-solicitacoes-global") || "[]")
    globalSolicitacoes.unshift(solicitacao)
    localStorage.setItem("medicina-solicitacoes-global", JSON.stringify(globalSolicitacoes))

    return solicitacao
  }

  async obterSolicitacoes(): Promise<SolicitacaoGlobal[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from("solicitacoes")
          .select(`
            *,
            paciente:usuarios!solicitacoes_paciente_id_fkey(nome, email, regiao, idade),
            medico:usuarios!solicitacoes_medico_id_fkey(nome),
            arquivos_solicitacao(*)
          `)
          .order("created_at", { ascending: false })

        if (!error && data) {
          return data.map(this.converterSupabaseParaLocal)
        }
      } catch (error) {
        console.log("Supabase indisponível, usando localStorage:", error)
        this.useSupabase = false
      }
    }

    // Fallback para localStorage
    return sistemaLocal.obterSolicitacoes()
  }

  async atualizarSolicitacao(id: string, dados: any): Promise<void> {
    if (this.useSupabase) {
      try {
        const { error } = await supabase.from("solicitacoes").update(dados).eq("id", id)

        if (!error) {
          return
        }
      } catch (error) {
        console.log("Supabase indisponível, usando localStorage:", error)
        this.useSupabase = false
      }
    }

    // Fallback para localStorage
    const globalSolicitacoes = JSON.parse(localStorage.getItem("medicina-solicitacoes-global") || "[]")
    const updatedSolicitacoes = globalSolicitacoes.map((sol: any) => (sol.id === id ? { ...sol, ...dados } : sol))
    localStorage.setItem("medicina-solicitacoes-global", JSON.stringify(updatedSolicitacoes))
  }

  async obterSolicitacoesPorPaciente(pacienteId: string): Promise<SolicitacaoSimples[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from("solicitacoes")
          .select("*")
          .eq("paciente_id", pacienteId)
          .order("created_at", { ascending: false })

        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            paciente_id: item.paciente_id,
            descricao: item.descricao,
            status: item.status,
            created_at: item.created_at,
          }))
        }
      } catch (error) {
        console.log("Supabase indisponível, usando localStorage:", error)
        this.useSupabase = false
      }
    }

    // Fallback para localStorage
    const saved = localStorage.getItem(`medicina-solicitacoes-${pacienteId}`)
    if (saved) {
      return JSON.parse(saved).map((sol: any) => ({
        id: sol.id,
        paciente_id: pacienteId,
        descricao: sol.descricao,
        status: sol.status,
        created_at: sol.criadaEm || new Date().toISOString(),
      }))
    }
    return []
  }

  async obterSolicitacoesDisponiveis(): Promise<SolicitacaoSimples[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from("solicitacoes")
          .select("*")
          .eq("status", "nova")
          .order("created_at", { ascending: false })

        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            paciente_id: item.paciente_id,
            descricao: item.descricao,
            status: item.status,
            created_at: item.created_at,
          }))
        }
      } catch (error) {
        console.log("Supabase indisponível, usando localStorage:", error)
        this.useSupabase = false
      }
    }

    // Fallback para localStorage
    const globalSolicitacoes = JSON.parse(localStorage.getItem("medicina-solicitacoes-global") || "[]")
    return globalSolicitacoes.filter((sol: any) => sol.status === "aguardando" || sol.status === "nova")
  }

  async aceitarSolicitacao(solicitacaoId: string, medicoId: string, medicoNome: string): Promise<boolean> {
    if (this.useSupabase) {
      try {
        const { error } = await supabase
          .from("solicitacoes")
          .update({
            medico_id: medicoId,
            status: "aceita",
            aceita_em: new Date().toISOString(),
          })
          .eq("id", solicitacaoId)

        if (!error) {
          return true
        }
      } catch (error) {
        console.log("Supabase indisponível, usando localStorage:", error)
        this.useSupabase = false
      }
    }

    // Fallback para localStorage
    return sistemaLocal.aceitarSolicitacao(solicitacaoId, medicoId, medicoNome)
  }

  async finalizarConsulta(solicitacaoId: string, finalizadoPor: "paciente" | "medico"): Promise<boolean> {
    if (this.useSupabase) {
      try {
        const { error } = await supabase
          .from("solicitacoes")
          .update({
            status: "finalizada",
            finalizada_em: new Date().toISOString(),
          })
          .eq("id", solicitacaoId)

        if (!error) {
          return true
        }
      } catch (error) {
        console.log("Supabase indisponível, usando localStorage:", error)
        this.useSupabase = false
      }
    }

    // Fallback para localStorage
    return sistemaLocal.finalizarConsulta(solicitacaoId, finalizadoPor)
  }

  private async salvarArquivosSupabase(solicitacaoId: string, arquivos: any[]) {
    for (const arquivo of arquivos) {
      await supabase.from("arquivos_solicitacao").insert({
        solicitacao_id: solicitacaoId,
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        dados: arquivo.url, // Base64 data
      })
    }
  }

  private converterSupabaseParaLocal(data: any): SolicitacaoGlobal {
    return {
      id: data.id,
      pacienteId: data.paciente_id,
      pacienteNome: data.paciente?.nome || "Paciente",
      pacienteEmail: data.paciente?.email || "",
      pacienteRegiao: data.paciente?.regiao || "",
      pacienteIdade: data.paciente?.idade,
      descricao: data.descricao,
      prioridade: data.prioridade,
      status: data.status,
      medicoId: data.medico_id,
      medicoNome: data.medico?.nome,
      criadaEm: new Date(data.created_at),
      aceitaEm: data.aceita_em ? new Date(data.aceita_em) : undefined,
      iniciadaEm: data.iniciada_em ? new Date(data.iniciada_em) : undefined,
      finalizadaEm: data.finalizada_em ? new Date(data.finalizada_em) : undefined,
      arquivos:
        data.arquivos_solicitacao?.map((arq: any) => ({
          id: arq.id,
          nome: arq.nome,
          tipo: arq.tipo,
          url: arq.dados,
        })) || [],
    }
  }

  calcularPrioridade(descricao: string): "baixa" | "media" | "alta" {
    return sistemaLocal.calcularPrioridade(descricao)
  }
}

export const sistemaConsultasHibrido = SistemaConsultasHibrido.getInstance()
