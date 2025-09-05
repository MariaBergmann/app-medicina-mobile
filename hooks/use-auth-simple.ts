"use client"

import { useState, useEffect } from "react"

export type UserType = "paciente" | "medico"

export interface User {
  id: string
  name: string
  email: string
  type: UserType
  cpf?: string
  endereco?: string
  telefone?: string
  regiao?: string
  crm?: string
  especialidade?: string
  disponibilidade?: string[]
}

export const useAuthSimple = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem("medicina-current-user")
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, type: UserType): Promise<boolean> => {
    try {
      const demoUsers: Record<string, User & { password: string }> = {
        "paciente@teste.com": {
          id: "demo-1",
          name: "João Silva",
          email: "paciente@teste.com",
          type: "paciente",
          password: "123456",
          cpf: "123.456.789-00",
          endereco: "Rua das Flores, 123",
          telefone: "(11) 99999-9999",
          regiao: "Interior de São Paulo",
        },
        "medico@teste.com": {
          id: "demo-2",
          name: "Dra. Maria Santos",
          email: "medico@teste.com",
          type: "medico",
          password: "123456",
          crm: "12345-SP",
          especialidade: "Clínica Geral",
          disponibilidade: ["Segunda", "Terça", "Quarta"],
        },
      }

      const foundUser = demoUsers[email]
      if (foundUser && foundUser.password === password && foundUser.type === type) {
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        setIsAuthenticated(true)
        localStorage.setItem("medicina-current-user", JSON.stringify(userWithoutPassword))
        return true
      }

      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || "",
        email: userData.email || "",
        type: userData.type || "paciente",
        ...userData,
      }

      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem("medicina-current-user", JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error("Erro no registro:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("medicina-current-user")
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }
}
