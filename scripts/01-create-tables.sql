-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('paciente', 'medico')),
  telefone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de perfis de pacientes
CREATE TABLE IF NOT EXISTS perfis_pacientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  data_nascimento DATE NOT NULL,
  endereco TEXT NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  cep VARCHAR(10) NOT NULL,
  regiao VARCHAR(100) NOT NULL,
  elegivel BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de perfis de médicos
CREATE TABLE IF NOT EXISTS perfis_medicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  crm VARCHAR(20) UNIQUE NOT NULL,
  especialidade VARCHAR(100) NOT NULL,
  disponivel BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de regiões elegíveis
CREATE TABLE IF NOT EXISTS regioes_elegiveis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de consultas
CREATE TABLE IF NOT EXISTS consultas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID REFERENCES perfis_pacientes(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES perfis_medicos(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  prioridade VARCHAR(10) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS mensagens_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consulta_id UUID REFERENCES consultas(id) ON DELETE CASCADE,
  remetente_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagem', 'arquivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir regiões elegíveis iniciais
INSERT INTO regioes_elegiveis (nome, estado) VALUES
('Interior do Amazonas', 'AM'),
('Zona Rural do Pará', 'PA'),
('Sertão da Bahia', 'BA'),
('Interior do Ceará', 'CE'),
('Zona Rural de Minas Gerais', 'MG'),
('Interior do Rio Grande do Sul', 'RS'),
('Zona Rural do Rio Grande do Sul', 'RS'),
('Serra Gaúcha - Região Remota', 'RS'),
('Fronteira Oeste do RS', 'RS'),
('Campanha Gaúcha', 'RS'),
('Norte do Rio Grande do Sul', 'RS'),
('Vale do Taquari - Área Rural', 'RS')
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_consultas_status ON consultas(status);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_medico ON consultas(medico_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_consulta ON mensagens_chat(consulta_id);
