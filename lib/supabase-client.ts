import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function criarUsuario(email: string, senha: string, nome: string, tipo: "paciente" | "medico") {
  const { data, error } = await supabase.from("usuarios").insert([{ email, senha, nome, tipo }]).select().single()

  if (error) throw error
  return data
}

export async function loginUsuario(email: string, senha: string) {
  const { data, error } = await supabase.from("usuarios").select("*").eq("email", email).eq("senha", senha).single()

  if (error) throw error
  return data
}

export async function criarSolicitacao(usuarioId: string, descricao: string) {
  const { data, error } = await supabase
    .from("solicitacoes")
    .insert([
      {
        paciente_id: usuarioId,
        descricao,
        status: "aguardando",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function buscarSolicitacoesPaciente(usuarioId: string) {
  const { data, error } = await supabase
    .from("solicitacoes")
    .select("*")
    .eq("paciente_id", usuarioId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function buscarTodasSolicitacoes() {
  const { data, error } = await supabase
    .from("solicitacoes")
    .select(`
      *,
      usuarios (nome, email)
    `)
    .eq("status", "aguardando")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function aceitarSolicitacao(solicitacaoId: string, medicoId: string) {
  const { data, error } = await supabase
    .from("solicitacoes")
    .update({
      status: "em_atendimento",
      medico_id: medicoId,
    })
    .eq("id", solicitacaoId)
    .select()
    .single()

  if (error) throw error
  return data
}
