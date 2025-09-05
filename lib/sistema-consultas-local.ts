export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: "paciente" | "medico"
  regiao?: string
  especialidade?: string
  crm?: string
}

export interface Solicitacao {
  id: string
  pacienteId: string
  pacienteNome: string
  pacienteRegiao: string
  queixa: string
  prioridade: "baixa" | "media" | "alta"
  status: "pendente" | "aceita" | "em_andamento" | "finalizada"
  criadaEm: string
  medicoId?: string
  medicoNome?: string
  iniciadaEm?: string
  finalizadaEm?: string
  duracaoMinutos?: number
  arquivos?: Array<{
    id: string
    nome: string
    tipo: string
    dados: string // base64
  }>
}

class SistemaConsultasLocal {
  private readonly STORAGE_KEYS = {
    usuarios: "medicina_usuarios",
    solicitacoes: "medicina_solicitacoes",
    usuarioAtual: "medicina_usuario_atual",
  }

  // Usuários
  criarUsuario(usuario: Omit<Usuario, "id">): Usuario {
    const novoUsuario: Usuario = {
      ...usuario,
      id: Date.now().toString(),
    }

    const usuarios = this.obterUsuarios()
    usuarios.push(novoUsuario)
    localStorage.setItem(this.STORAGE_KEYS.usuarios, JSON.stringify(usuarios))

    return novoUsuario
  }

  obterUsuarios(): Usuario[] {
    const dados = localStorage.getItem(this.STORAGE_KEYS.usuarios)
    return dados ? JSON.parse(dados) : []
  }

  obterUsuarioPorEmail(email: string): Usuario | null {
    const usuarios = this.obterUsuarios()
    return usuarios.find((u) => u.email === email) || null
  }

  definirUsuarioAtual(usuario: Usuario): void {
    localStorage.setItem(this.STORAGE_KEYS.usuarioAtual, JSON.stringify(usuario))
  }

  obterUsuarioAtual(): Usuario | null {
    const dados = localStorage.getItem(this.STORAGE_KEYS.usuarioAtual)
    return dados ? JSON.parse(dados) : null
  }

  // Solicitações
  criarSolicitacao(solicitacao: Omit<Solicitacao, "id" | "criadaEm" | "status">): Solicitacao {
    const novaSolicitacao: Solicitacao = {
      ...solicitacao,
      id: Date.now().toString(),
      criadaEm: new Date().toISOString(),
      status: "pendente",
      prioridade: this.calcularPrioridade(solicitacao.queixa),
    }

    const solicitacoes = this.obterSolicitacoes()
    solicitacoes.push(novaSolicitacao)
    localStorage.setItem(this.STORAGE_KEYS.solicitacoes, JSON.stringify(solicitacoes))

    return novaSolicitacao
  }

  obterSolicitacoes(): Solicitacao[] {
    const dados = localStorage.getItem(this.STORAGE_KEYS.solicitacoes)
    return dados ? JSON.parse(dados) : []
  }

  obterSolicitacoesPorPaciente(pacienteId: string): Solicitacao[] {
    return this.obterSolicitacoes().filter((s) => s.pacienteId === pacienteId)
  }

  obterSolicitacoesPorMedico(medicoId: string): Solicitacao[] {
    return this.obterSolicitacoes().filter((s) => s.medicoId === medicoId)
  }

  obterSolicitacoesDisponiveis(): Solicitacao[] {
    return this.obterSolicitacoes().filter((s) => s.status === "pendente")
  }

  aceitarSolicitacao(solicitacaoId: string, medicoId: string, medicoNome: string): boolean {
    const solicitacoes = this.obterSolicitacoes()
    const index = solicitacoes.findIndex((s) => s.id === solicitacaoId)

    if (index !== -1) {
      solicitacoes[index] = {
        ...solicitacoes[index],
        status: "aceita",
        medicoId,
        medicoNome,
      }
      localStorage.setItem(this.STORAGE_KEYS.solicitacoes, JSON.stringify(solicitacoes))
      return true
    }
    return false
  }

  iniciarConsulta(solicitacaoId: string): boolean {
    const solicitacoes = this.obterSolicitacoes()
    const index = solicitacoes.findIndex((s) => s.id === solicitacaoId)

    if (index !== -1) {
      solicitacoes[index] = {
        ...solicitacoes[index],
        status: "em_andamento",
        iniciadaEm: new Date().toISOString(),
      }
      localStorage.setItem(this.STORAGE_KEYS.solicitacoes, JSON.stringify(solicitacoes))
      return true
    }
    return false
  }

  finalizarConsulta(solicitacaoId: string): boolean {
    const solicitacoes = this.obterSolicitacoes()
    const index = solicitacoes.findIndex((s) => s.id === solicitacaoId)

    if (index !== -1 && solicitacoes[index].iniciadaEm) {
      const iniciadaEm = new Date(solicitacoes[index].iniciadaEm!)
      const finalizadaEm = new Date()
      const duracaoMinutos = Math.round((finalizadaEm.getTime() - iniciadaEm.getTime()) / (1000 * 60))

      solicitacoes[index] = {
        ...solicitacoes[index],
        status: "finalizada",
        finalizadaEm: finalizadaEm.toISOString(),
        duracaoMinutos,
      }
      localStorage.setItem(this.STORAGE_KEYS.solicitacoes, JSON.stringify(solicitacoes))
      return true
    }
    return false
  }

  obterSolicitacaoPorId(id: string): Solicitacao | null {
    const solicitacoes = this.obterSolicitacoes()
    return solicitacoes.find((s) => s.id === id) || null
  }

  private calcularPrioridade(queixa: string): "baixa" | "media" | "alta" {
    const queixaLower = queixa.toLowerCase()

    if (
      queixaLower.includes("dor no peito") ||
      queixaLower.includes("falta de ar") ||
      queixaLower.includes("sangramento") ||
      queixaLower.includes("emergência")
    ) {
      return "alta"
    }

    if (
      queixaLower.includes("febre") ||
      queixaLower.includes("dor") ||
      queixaLower.includes("vômito") ||
      queixaLower.includes("tontura")
    ) {
      return "media"
    }

    return "baixa"
  }
}

export const sistemaConsultas = new SistemaConsultasLocal()
