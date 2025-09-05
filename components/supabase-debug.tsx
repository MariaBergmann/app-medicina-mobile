"use client"

import { useEffect, useState } from "react"
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client"

export function SupabaseDebug() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const checkConnection = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setConnectionStatus("error")
        setErrorMessage("Variáveis de ambiente não configuradas")
        return
      }

      try {
        const { data, error } = await supabase.from("usuarios").select("count").limit(1)
        if (error) throw error
        setConnectionStatus("connected")
      } catch (error) {
        setConnectionStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Erro desconhecido")
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold mb-2">Status Supabase</h3>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Configurado:</span>
          <span className={`px-2 py-1 rounded text-white ${isSupabaseConfigured ? "bg-green-500" : "bg-red-500"}`}>
            {isSupabaseConfigured ? "Sim" : "Não"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Conexão:</span>
          <span
            className={`px-2 py-1 rounded text-white ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-gray-500"
            }`}
          >
            {connectionStatus === "checking"
              ? "Verificando..."
              : connectionStatus === "connected"
                ? "Conectado"
                : "Erro"}
          </span>
        </div>
        {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
        <div className="text-gray-600 mt-2">
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗"}</p>
          <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓" : "✗"}</p>
        </div>
      </div>
    </div>
  )
}
