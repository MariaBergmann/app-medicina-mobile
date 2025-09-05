-- Criar tabelas para o sistema de telemedicina
-- Execute este script no Supabase SQL Editor

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('paciente', 'medico')),
  regiao VARCHAR(255),
  idade INTEGER,
  crm VARCHAR(50), -- Para médicos
  especialidade VARCHAR(255), -- Para médicos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de solicitações
CREATE TABLE IF NOT EXISTS solicitacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  prioridade VARCHAR(10) NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('nova', 'aceita', 'em_atendimento', 'finalizada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aceita_em TIMESTAMP WITH TIME ZONE,
  iniciada_em TIMESTAMP WITH TIME ZONE,
  finalizada_em TIMESTAMP WITH TIME ZONE
);

-- Tabela de arquivos anexados
CREATE TABLE IF NOT EXISTS arquivos_solicitacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitacao_id UUID REFERENCES solicitacoes(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  dados TEXT NOT NULL, -- Base64 dos arquivos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('info', 'success', 'warning', 'error')),
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_paciente ON solicitacoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_medico ON solicitacoes(medico_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- RLS (Row Level Security) - Opcional para segurança
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos_solicitacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
