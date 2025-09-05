"use client"

import { useState, useEffect } from "react"

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: "info" | "success" | "warning" | "error"
  timestamp: Date
  lida: boolean
}

export function useNotifications() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])

  // Solicitar permissão para notificações
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const adicionarNotificacao = (notificacao: Omit<Notificacao, "id" | "timestamp" | "lida">) => {
    const novaNotificacao: Notificacao = {
      ...notificacao,
      id: Date.now().toString(),
      timestamp: new Date(),
      lida: false,
    }

    setNotificacoes((prev) => [novaNotificacao, ...prev])

    // Mostrar notificação do navegador
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notificacao.titulo, {
        body: notificacao.mensagem,
        icon: "/favicon.ico",
      })
    }

    return novaNotificacao.id
  }

  const marcarComoLida = (id: string) => {
    setNotificacoes((prev) => prev.map((notif) => (notif.id === id ? { ...notif, lida: true } : notif)))
  }

  const removerNotificacao = (id: string) => {
    setNotificacoes((prev) => prev.filter((notif) => notif.id !== id))
  }

  const notificacaoesNaoLidas = notificacoes.filter((n) => !n.lida).length

  return {
    notificacoes,
    notificacaoesNaoLidas,
    adicionarNotificacao,
    marcarComoLida,
    removerNotificacao,
  }
}
