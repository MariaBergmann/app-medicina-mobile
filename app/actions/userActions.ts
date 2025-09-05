import { supabase } from "@/lib/supabaseClient"

export async function createUser(
  email: string,
  password: string,
  nome: string,
  tipo: "medico" | "paciente",
  especialidade?: string,
  cidade?: string,
) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(error.message)

  const user = data.user
  if (!user) throw new Error("Usuário não criado")

  // Salvar dados complementares na tabela correspondente
  if (tipo === "medico") {
    const { error: insertError } = await supabase.from("medicos").insert([
      {
        id: user.id,
        nome,
        email,
        especialidade: especialidade || "",
        cidade: cidade || "",
        disponivel: true,
      },
    ])
    if (insertError) throw new Error(insertError.message)
  } else {
    const { error: insertError } = await supabase.from("usuarios").insert([
      {
        id: user.id,
        nome,
        email,
        tipo: "paciente",
      },
    ])
    if (insertError) throw new Error(insertError.message)
  }

  return user
}

export async function loginUser(email: string, password: string, tipo: "medico" | "paciente") {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  const user = data.user
  if (!user) throw new Error("Login falhou")

  // Buscar dados complementares
  let userData
  if (tipo === "medico") {
    const { data: medico, error: fetchError } = await supabase.from("medicos").select("*").eq("id", user.id).single()

    if (fetchError) throw new Error("Dados do médico não encontrados")
    userData = medico
  } else {
    const { data: paciente, error: fetchError } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

    if (fetchError) throw new Error("Dados do paciente não encontrados")
    userData = paciente
  }

  return { user, userData }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("usuarios").select("*").eq("id", userId).single()

  if (error) throw new Error(error.message)
  return data
}
