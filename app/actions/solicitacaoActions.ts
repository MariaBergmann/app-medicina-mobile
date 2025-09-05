import { supabase } from "@/lib/supabaseClient"

export async function createSolicitacao(userId: string, title: string, description: string) {
  const { data, error } = await supabase
    .from("solicitacoes")
    .insert([{ user_id: userId, title, description }])
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getSolicitacoes(userId: string) {
  const { data, error } = await supabase.from("solicitacoes").select("*").eq("user_id", userId)
  if (error) throw new Error(error.message)
  return data
}
