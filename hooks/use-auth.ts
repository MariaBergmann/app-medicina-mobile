"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserType = "paciente" | "medico"

export interface User {
  id: string
  name: string
  email: string
  type: UserType
  password?: string // Adicionando campo senha
  // Campos específicos para pacientes
  cpf?: string
  endereco?: string
  telefone?: string
  regiao?: string
  // Campos específicos para médicos
  crm?: string
  especialidade?: string
  disponibilidade?: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, type: UserType) => Promise<boolean>
  register: (userData: Partial<User>, password: string) => Promise<boolean>
  logout: () => void
  getRegisteredUsers: () => User[]
}

const getUsersFromStorage = (): User[] => {
  if (typeof window === "undefined") return []
  try {
    const users = localStorage.getItem("medicina-registered-users")
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error("Erro ao carregar usuários:", error)
    return []
  }
}

const saveUsersToStorage = (users: User[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("medicina-registered-users", JSON.stringify(users))
  } catch (error) {
    console.error("Erro ao salvar usuários:", error)
  }
}

const addUserToStorage = (user: User) => {
  const users = getUsersFromStorage()
  const existingIndex = users.findIndex((u) => u.email === user.email)

  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }

  saveUsersToStorage(users)
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string, type: UserType) => {
        try {
          const registeredUsers = getUsersFromStorage()

          // Mock de usuários padrão para demonstração
          const mockUsers = {
            "paciente@teste.com": {
              id: "demo-1",
              name: "João Silva",
              email: "paciente@teste.com",
              type: "paciente" as UserType,
              password: "123456", // Senha específica para demo
              cpf: "123.456.789-00",
              endereco: "Rua das Flores, 123",
              telefone: "(11) 99999-9999",
              regiao: "Interior de São Paulo",
            },
            "medico@teste.com": {
              id: "demo-2",
              name: "Dra. Maria Santos",
              email: "medico@teste.com",
              type: "medico" as UserType,
              password: "123456", // Senha específica para demo
              crm: "12345-SP",
              especialidade: "Clínica Geral",
              disponibilidade: ["Segunda", "Terça", "Quarta"],
            },
          }

          let user = registeredUsers.find((u) => u.email === email && u.type === type)

          // Se não encontrar, verificar usuários mock
          if (!user) {
            user = mockUsers[email as keyof typeof mockUsers]
          }

          if (user && user.type === type && user.password === password) {
            console.log("Login realizado com sucesso:", user.name)
            const { password: _, ...userWithoutPassword } = user
            set({ user: userWithoutPassword, isAuthenticated: true })
            return true
          }

          console.log("Credenciais inválidas")
          return false
        } catch (error) {
          console.error("Erro no login:", error)
          return false
        }
      },

      register: async (userData: Partial<User>, password: string) => {
        try {
          const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name || "",
            email: userData.email || "",
            type: userData.type || "paciente",
            password, // Salvar senha do usuário
            ...userData,
          }

          addUserToStorage(newUser)
          console.log("Usuário registrado com sucesso:", newUser.name)

          const { password: _, ...userWithoutPassword } = newUser
          set({ user: userWithoutPassword, isAuthenticated: true })
          return true
        } catch (error) {
          console.error("Erro no registro:", error)
          return false
        }
      },

      logout: () => {
        console.log("Logout realizado")
        set({ user: null, isAuthenticated: false })
      },

      getRegisteredUsers: () => {
        return getUsersFromStorage()
      },
    }),
    {
      name: "medicina-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
