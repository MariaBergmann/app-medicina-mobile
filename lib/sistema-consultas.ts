export interface SolicitacaoGlobal {
  id: string
  pacienteId: string
  pacienteNome: string
  pacienteEmail: string
  pacienteRegiao: string
  pacienteIdade?: number
  descricao: string
  prioridade: "baixa" | "media" | "alta"
  status: "nova" | "aceita" | "em_atendimento" | "finalizada"
  medicoId?: string
  medicoNome?: string
  criadaEm: Date
  aceitaEm?: Date
  iniciadaEm?: Date
  finalizadaEm?: Date
  arquivos?: Array<{
    id: string
    nome: string
    tipo: string
    url: string
  }>
}

export interface NotificacaoGlobal {
  id: string
  usuarioId: string
  titulo: string
  mensagem: string
  tipo: "info" | "success" | "warning" | "error"
  lida: boolean
  criadaEm: Date
}

class SistemaConsultas {
  private static instance: SistemaConsultas
  private readonly SOLICITACOES_KEY = "medicina_solicitacoes_globais"
  private readonly NOTIFICACOES_KEY = "medicina_notificacoes_globais"

  static getInstance(): SistemaConsultas {
    if (!SistemaConsultas.instance) {
      SistemaConsultas.instance = new SistemaConsultas()
    }
    return SistemaConsultas.instance
  }

  // Solicitações
  criarSolicitacao(solicitacao: Omit<SolicitacaoGlobal, "id" | "criadaEm">): SolicitacaoGlobal {
    const novaSolicitacao: SolicitacaoGlobal = {
      ...solicitacao,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      criadaEm: new Date(),
    }

    const solicitacoes = this.obterSolicitacoes()
    solicitacoes.push(novaSolicitacao)
    this.salvarSolicitacoes(solicitacoes)

    // Notificar todos os médicos disponíveis
    this.notificarMedicos(
      "Nova solicitação disponível!",
      `${solicitacao.pacienteNome} precisa de atendimento médico.`,
      "info",
    )

    return novaSolicitacao
  }

  obterSolicitacoes(): SolicitacaoGlobal[] {
    try {
      const data = localStorage.getItem(this.SOLICITACOES_KEY)
      if (!data) return []

      const solicitacoes = JSON.parse(data)
      return solicitacoes.map((sol: any) => ({
        ...sol,
        criadaEm: new Date(sol.criadaEm),
        aceitaEm: sol.aceitaEm ? new Date(sol.aceitaEm) : undefined,
        iniciadaEm: sol.iniciadaEm ? new Date(sol.iniciadaEm) : undefined,
        finalizadaEm: sol.finalizadaEm ? new Date(sol.finalizadaEm) : undefined,
      }))
    } catch {
      return []
    }
  }

  obterSolicitacoesPorPaciente(pacienteId: string): SolicitacaoGlobal[] {
    return this.obterSolicitacoes().filter((sol) => sol.pacienteId === pacienteId)
  }

  obterSolicitacoesPorMedico(medicoId: string): SolicitacaoGlobal[] {
    return this.obterSolicitacoes().filter((sol) => sol.medicoId === medicoId)
  }

  obterSolicitacoesDisponiveis(): SolicitacaoGlobal[] {
    return this.obterSolicitacoes().filter((sol) => sol.status === "nova")
  }

  aceitarSolicitacao(solicitacaoId: string, medicoId: string, medicoNome: string): boolean {
    const solicitacoes = this.obterSolicitacoes()
    const index = solicitacoes.findIndex((sol) => sol.id === solicitacaoId)

    if (index === -1) return false

    solicitacoes[index] = {
      ...solicitacoes[index],
      status: "aceita",
      medicoId,
      medicoNome,
      aceitaEm: new Date(),
    }

    this.salvarSolicitacoes(solicitacoes)

    // Notificar o paciente
    this.criarNotificacao(
      solicitacoes[index].pacienteId,
      "Solicitação aceita!",
      `${medicoNome} aceitou sua solicitação e iniciará o atendimento em breve.`,
      "success",
    )

    return true
  }

  iniciarAtendimento(solicitacaoId: string): boolean {
    const solicitacoes = this.obterSolicitacoes()
    const index = solicitacoes.findIndex((sol) => sol.id === solicitacaoId)

    if (index === -1) return false

    solicitacoes[index] = {
      ...solicitacoes[index],
      status: "em_atendimento",
      iniciadaEm: new Date(),
    }

    this.salvarSolicitacoes(solicitacoes)

    // Notificar o paciente
    this.criarNotificacao(
      solicitacoes[index].pacienteId,
      "Atendimento iniciado!",
      `${solicitacoes[index].medicoNome} iniciou seu atendimento. Acesse o chat para conversar.`,
      "success",
    )

    return true
  }

  finalizarConsulta(solicitacaoId: string, finalizadoPor: "paciente" | "medico"): boolean {
    const solicitacoes = this.obterSolicitacoes()
    const index = solicitacoes.findIndex((sol) => sol.id === solicitacaoId)

    if (index === -1) return false

    solicitacoes[index] = {
      ...solicitacoes[index],
      status: "finalizada",
      finalizadaEm: new Date(),
    }

    this.salvarSolicitacoes(solicitacoes)

    // Notificar ambas as partes
    if (finalizadoPor === "medico") {
      this.criarNotificacao(
        solicitacoes[index].pacienteId,
        "Consulta finalizada",
        `Sua consulta com ${solicitacoes[index].medicoNome} foi finalizada. Obrigado por usar nossos serviços!`,
        "info",
      )
    } else {
      if (solicitacoes[index].medicoId) {
        this.criarNotificacao(
          solicitacoes[index].medicoId,
          "Consulta finalizada pelo paciente",
          `A consulta com ${solicitacoes[index].pacienteNome} foi finalizada.`,
          "info",
        )
      }
    }

    return true
  }

  private salvarSolicitacoes(solicitacoes: SolicitacaoGlobal[]): void {
    localStorage.setItem(this.SOLICITACOES_KEY, JSON.stringify(solicitacoes))
  }

  // Notificações
  criarNotificacao(usuarioId: string, titulo: string, mensagem: string, tipo: NotificacaoGlobal["tipo"]): void {
    const notificacao: NotificacaoGlobal = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      usuarioId,
      titulo,
      mensagem,
      tipo,
      lida: false,
      criadaEm: new Date(),
    }

    const notificacoes = this.obterNotificacoes()
    notificacoes.push(notificacao)
    this.salvarNotificacoes(notificacoes)
  }

  obterNotificacoesPorUsuario(usuarioId: string): NotificacaoGlobal[] {
    return this.obterNotificacoes()
      .filter((notif) => notif.usuarioId === usuarioId)
      .sort((a, b) => b.criadaEm.getTime() - a.criadaEm.getTime())
  }

  marcarNotificacaoComoLida(notificacaoId: string): void {
    const notificacoes = this.obterNotificacoes()
    const index = notificacoes.findIndex((notif) => notif.id === notificacaoId)

    if (index !== -1) {
      notificacoes[index].lida = true
      this.salvarNotificacoes(notificacoes)
    }
  }

  private obterNotificacoes(): NotificacaoGlobal[] {
    try {
      const data = localStorage.getItem(this.NOTIFICACOES_KEY)
      if (!data) return []

      const notificacoes = JSON.parse(data)
      return notificacoes.map((notif: any) => ({
        ...notif,
        criadaEm: new Date(notif.criadaEm),
      }))
    } catch {
      return []
    }
  }

  private salvarNotificacoes(notificacoes: NotificacaoGlobal[]): void {
    localStorage.setItem(this.NOTIFICACOES_KEY, JSON.stringify(notificacoes))
  }

  private notificarMedicos(titulo: string, mensagem: string, tipo: NotificacaoGlobal["tipo"]): void {
    // Obter todos os médicos cadastrados (simplificado - em produção seria do banco)
    const medicosConhecidos = ["medico@teste.com", "dra.maria@teste.com"] // IDs dos médicos

    medicosConhecidos.forEach((medicoId) => {
      this.criarNotificacao(medicoId, titulo, mensagem, tipo)
    })
  }

  // Utilitários
  calcularPrioridade(descricao: string): "baixa" | "media" | "alta" {
    const palavrasUrgentes = ["dor no peito", "falta de ar", "sangramento", "febre alta", "desmaio", "convulsão"]
    const palavrasMedias = ["febre", "dor", "mal-estar", "tontura", "náusea"]

    const descricaoLower = descricao.toLowerCase()

    if (palavrasUrgentes.some((palavra) => descricaoLower.includes(palavra))) {
      return "alta"
    }

    if (palavrasMedias.some((palavra) => descricaoLower.includes(palavra))) {
      return "media"
    }

    return "baixa"
  }
}

export const sistemaConsultas = SistemaConsultas.getInstance()
