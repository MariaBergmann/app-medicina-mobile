"use client"

import { createUser, loginUser } from "@/app/actions/userActions"
import { useState } from "react"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSignup() {
    try {
      await createUser(email, password)
      alert("Usuário criado com sucesso!")
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleLogin() {
    try {
      await loginUser(email, password)
      alert("Login realizado!")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login / Cadastro</h1>
      <div className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSignup}>
            Cadastrar
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleLogin}>
            Login
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  )
}
