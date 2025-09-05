import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardPacienteClient from "./dashboard-client"

export default async function DashboardPacientePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login/paciente")
  }

  // Buscar dados do usuário na tabela usuarios
  const { data: userData } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

  if (!userData || userData.tipo !== "paciente") {
    redirect("/login/paciente")
  }

  // Buscar solicitações do paciente
  const { data: solicitacoes } = await supabase
    .from("solicitacoes")
    .select("*")
    .eq("paciente_id", user.id)
    .order("created_at", { ascending: false })

  return <DashboardPacienteClient user={userData} initialSolicitacoes={solicitacoes || []} />
}
