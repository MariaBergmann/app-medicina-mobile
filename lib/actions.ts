"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const nome = formData.get("nome")
  const tipo = formData.get("tipo") || "paciente"

  if (!email || !password || !nome) {
    return { error: "Email, password and name are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
    })

    if (authError) {
      return { error: authError.message }
    }

    if (authData.user) {
      const { error: dbError } = await supabase.from("usuarios").insert({
        id: authData.user.id,
        email: email.toString(),
        nome: nome.toString(),
        tipo: tipo.toString(),
      })

      if (dbError) {
        console.error("Database error:", dbError)
        return { error: "Failed to save user data" }
      }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/")
}

export async function criarSolicitacao(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  const descricao = formData.get("descricao")
  const prioridade = formData.get("prioridade") || "normal"

  if (!descricao) {
    return { error: "Descrição é obrigatória" }
  }

  try {
    const { error } = await supabase.from("solicitacoes").insert({
      paciente_id: user.id,
      descricao: descricao.toString(),
      prioridade: prioridade.toString(),
      status: "pendente",
    })

    if (error) {
      console.error("Database error:", error)
      return { error: "Failed to create request" }
    }

    return { success: "Solicitação enviada com sucesso!" }
  } catch (error) {
    console.error("Create request error:", error)
    return { error: "An unexpected error occurred" }
  }
}
