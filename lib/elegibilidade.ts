// Sistema de verificação de elegibilidade por região

export interface RegiaoElegivel {
  id: string
  nome: string
  estado: string
  criterios: string
  ativa: boolean
  criadaEm: Date
  criadaPor: string
}

// Mock de regiões elegíveis - em produção viria de uma API/banco de dados
const regioes: RegiaoElegivel[] = [
  {
    id: "1",
    nome: "Interior de São Paulo",
    estado: "São Paulo",
    criterios: "Municípios com menos de 50.000 habitantes e distância superior a 100km da capital",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Prefeitura de São Paulo",
  },
  {
    id: "2",
    nome: "Zona Rural - Bahia",
    estado: "Bahia",
    criterios: "Comunidades rurais sem acesso a unidades básicas de saúde em raio de 50km",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Governo do Estado da Bahia",
  },
  {
    id: "3",
    nome: "Amazônia - Acre",
    estado: "Acre",
    criterios: "Comunidades ribeirinhas e indígenas com acesso limitado a transporte",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Secretaria de Saúde do Acre",
  },
  {
    id: "4",
    nome: "Sertão Nordestino",
    estado: "Ceará",
    criterios: "Municípios do semiárido com população inferior a 30.000 habitantes",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Governo do Estado do Ceará",
  },
  {
    id: "5",
    nome: "Pantanal - Mato Grosso",
    estado: "Mato Grosso",
    criterios: "Comunidades pantaneiras com acesso limitado por via terrestre",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Secretaria de Saúde de MT",
  },
  {
    id: "6",
    nome: "Interior do Rio Grande do Sul",
    estado: "Rio Grande do Sul",
    criterios: "Municípios do interior com menos de 30.000 habitantes e distância superior a 80km de Porto Alegre",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Governo do Estado do RS",
  },
  {
    id: "7",
    nome: "Zona Rural - Rio Grande do Sul",
    estado: "Rio Grande do Sul",
    criterios: "Comunidades rurais e assentamentos com acesso limitado a serviços de saúde",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Secretaria de Saúde do RS",
  },
  {
    id: "8",
    nome: "Serra Gaúcha - Interior",
    estado: "Rio Grande do Sul",
    criterios: "Municípios da serra com população inferior a 20.000 habitantes",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Consórcio Intermunicipal da Serra",
  },
  {
    id: "9",
    nome: "Fronteira Oeste - RS",
    estado: "Rio Grande do Sul",
    criterios: "Municípios da fronteira com Uruguai e Argentina com acesso limitado a especialistas",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Prefeituras da Fronteira Oeste",
  },
  {
    id: "10",
    nome: "Campanha Gaúcha",
    estado: "Rio Grande do Sul",
    criterios: "Estâncias e comunidades rurais da região da Campanha",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Associação dos Municípios da Campanha",
  },
  {
    id: "11",
    nome: "Norte do Rio Grande do Sul",
    estado: "Rio Grande do Sul",
    criterios: "Municípios do norte gaúcho com população inferior a 25.000 habitantes",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "Consórcio Intermunicipal do Norte",
  },
  {
    id: "12",
    nome: "Vale do Taquari - Interior",
    estado: "Rio Grande do Sul",
    criterios: "Pequenos municípios do Vale do Taquari com acesso limitado a especialidades médicas",
    ativa: true,
    criadaEm: new Date(),
    criadaPor: "CODEVAT",
  },
]

export function verificarElegibilidade(regiaoInformada: string): {
  elegivel: boolean
  regiaoEncontrada?: RegiaoElegivel
  motivo?: string
} {
  if (!regiaoInformada || regiaoInformada.trim().length === 0) {
    return {
      elegivel: false,
      motivo: "Região não informada",
    }
  }

  // Normalizar a região informada para comparação
  const regiaoNormalizada = regiaoInformada.toLowerCase().trim()

  // Buscar por correspondência exata ou parcial
  const regiaoEncontrada = regioes.find((regiao) => {
    if (!regiao.ativa) return false

    const nomeRegiao = regiao.nome.toLowerCase()
    const estadoRegiao = regiao.estado.toLowerCase()

    // Verificar correspondência exata
    if (nomeRegiao === regiaoNormalizada) return true

    // Verificar se a região informada contém o nome da região elegível
    if (regiaoNormalizada.includes(nomeRegiao)) return true

    // Verificar se a região informada contém o estado
    if (regiaoNormalizada.includes(estadoRegiao)) {
      // Se contém o estado, verificar se também contém palavras-chave
      const palavrasChave = [
        "interior",
        "rural",
        "zona rural",
        "amazônia",
        "sertão",
        "pantanal",
        "serra gaúcha",
        "fronteira oeste",
        "campanha",
        "norte",
        "vale do taquari",
      ]
      return palavrasChave.some((palavra) => regiaoNormalizada.includes(palavra))
    }

    return false
  })

  if (regiaoEncontrada) {
    return {
      elegivel: true,
      regiaoEncontrada,
    }
  }

  return {
    elegivel: false,
    motivo: "Região não está na lista de áreas elegíveis para atendimento gratuito",
  }
}

export function obterRegioesElegiveis(): RegiaoElegivel[] {
  return regioes.filter((regiao) => regiao.ativa)
}

export function obterSugestoesRegioes(): string[] {
  return regioes
    .filter((regiao) => regiao.ativa)
    .map((regiao) => regiao.nome)
    .sort()
}
