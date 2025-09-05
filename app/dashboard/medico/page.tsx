import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardMedicoClient from "./dashboard-client"

export default async function DashboardMedicoPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login/medico")
  }

  // Buscar dados do usuário na tabela usuarios
  const { data: userData } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!userData || userData.tipo !== "medico") {
    redirect("/login/medico")
  }

  // Buscar solicitações pendentes
  const { data: solicitacoes } = await supabase
    .from("solicitacoes")
    .select(`
      *,
      usuarios!solicitacoes_paciente_id_fkey(nome)
    `)
    .eq("status", "pendente")
    .order("created_at", { ascending: false })

  return <DashboardMedicoClient user={userData} initialSolicitacoes={solicitacoes || []} />
}
