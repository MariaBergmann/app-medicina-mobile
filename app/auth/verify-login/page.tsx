"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function VerifyLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const email = searchParams.get("email")
    const password = searchParams.get("password")
    const type = searchParams.get("type")

    if (email && password && type) {
      // Verificar no localStorage
      const existingUsers = JSON.parse(localStorage.getItem("medicina_usuarios") || "[]")

      const user = existingUsers.find((u: any) => u.email === email && u.password === password && u.tipo === type)

      if (user) {
        // Login bem-sucedido
        const dashboardPath = type === "paciente" ? "/dashboard/paciente" : "/dashboard/medico"
        router.push(dashboardPath)
      } else {
        // Login falhou
        const loginPath = type === "paciente" ? "/login/paciente" : "/login/medico"
        router.push(`${loginPath}?error=Email ou senha incorretos`)
      }
    } else {
      router.push("/")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
