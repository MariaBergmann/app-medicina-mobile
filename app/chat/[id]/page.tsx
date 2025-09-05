"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Send, Video, Mic, MicOff, PhoneOff, User, Camera, CameraOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { sistemaConsultas } from "@/lib/sistema-consultas"

interface Mensagem {
  id: string
  remetente: "medico" | "paciente"
  conteudo: string
  timestamp: Date
  tipo: "texto" | "sistema"
}

interface DadosConsulta {
  id: string
  pacienteNome: string
  medicoNome: string
  descricao: string
  status: "ativa" | "finalizada"
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const chatId = params.id as string

  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [novaMensagem, setNovaMensagem] = useState("")
  const [consulta, setConsulta] = useState<DadosConsulta | null>(null)
  const [videoAtivo, setVideoAtivo] = useState(false)
  const [audioAtivo, setAudioAtivo] = useState(true)
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [chamadaAtiva, setChamadaAtiva] = useState(false)
  const [visualizacaoGrande, setVisualizacaoGrande] = useState(true)
  const [consultaFinalizada, setConsultaFinalizada] = useState(false)
  const [outraPessoaConectada, setOutraPessoaConectada] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const solicitacaoGlobal = sistemaConsultas.obterSolicitacoes().find((sol) => sol.id === chatId)

    if (solicitacaoGlobal) {
      setConsulta({
        id: chatId,
        pacienteNome: solicitacaoGlobal.pacienteNome,
        medicoNome: solicitacaoGlobal.medicoNome || "Médico",
        descricao: solicitacaoGlobal.descricao,
        status: solicitacaoGlobal.status === "finalizada" ? "finalizada" : "ativa",
      })
    } else {
      // Fallback para dados mock se não encontrar
      setConsulta({
        id: chatId,
        pacienteNome: "João Silva",
        medicoNome: "Dra. Maria Santos",
        descricao: "Dor no peito há 2 horas, acompanhada de falta de ar",
        status: "ativa",
      })
    }

    setMensagens([
      {
        id: "1",
        remetente: "sistema",
        conteudo: "Consulta iniciada",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        tipo: "sistema",
      },
      {
        id: "2",
        remetente: "medico",
        conteudo: `Olá! Sou ${solicitacaoGlobal?.medicoNome || "a Dra. Maria Santos"}. Como posso ajudá-lo hoje?`,
        timestamp: new Date(Date.now() - 9 * 60 * 1000),
        tipo: "texto",
      },
      {
        id: "3",
        remetente: "paciente",
        conteudo: "Boa tarde, doutora. Estou com uma dor no peito há algumas horas e estou preocupado.",
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        tipo: "texto",
      },
      {
        id: "4",
        remetente: "medico",
        conteudo: "Entendi sua preocupação. Pode me descrever melhor a dor? É uma dor aguda, em queimação, ou pressão?",
        timestamp: new Date(Date.now() - 7 * 60 * 1000),
        tipo: "texto",
      },
    ])
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [mensagens])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleEnviarMensagem = () => {
    if (!novaMensagem.trim() || !user) return

    const mensagem: Mensagem = {
      id: Date.now().toString(),
      remetente: user.type === "medico" ? "medico" : "paciente",
      conteudo: novaMensagem,
      timestamp: new Date(),
      tipo: "texto",
    }

    setMensagens((prev) => [...prev, mensagem])
    setNovaMensagem("")

    if (user.type === "paciente") {
      setTimeout(() => {
        const resposta: Mensagem = {
          id: (Date.now() + 1).toString(),
          remetente: "medico",
          conteudo: "Entendi. Vou analisar suas informações. Podemos fazer uma videochamada para uma avaliação melhor?",
          timestamp: new Date(),
          tipo: "texto",
        }
        setMensagens((prev) => [...prev, resposta])
      }, 2000)
    }
  }

  const handleIniciarVideo = async () => {
    try {
      if (!videoAtivo) {
        setVideoAtivo(true)
        setCameraAtiva(true)
        setChamadaAtiva(true)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: audioAtivo,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.muted = true
          try {
            await videoRef.current.play()
            console.log("Vídeo local iniciado com sucesso")
          } catch (playError) {
            console.error("Erro ao reproduzir vídeo:", playError)
          }
        }

        const mensagemSistema: Mensagem = {
          id: Date.now().toString(),
          remetente: "sistema",
          conteudo: "Videochamada iniciada",
          timestamp: new Date(),
          tipo: "sistema",
        }
        setMensagens((prev) => [...prev, mensagemSistema])
      } else {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => {
            track.stop()
            console.log("Track parado:", track.kind)
          })
          videoRef.current.srcObject = null
        }
        if (remoteVideoRef.current?.srcObject) {
          remoteVideoRef.current.srcObject = null
        }
        setVideoAtivo(false)
        setCameraAtiva(false)
        setChamadaAtiva(false)
        setOutraPessoaConectada(false)
      }
    } catch (error) {
      console.error("Erro detalhado ao acessar câmera:", error)

      setVideoAtivo(false)
      setCameraAtiva(false)
      setChamadaAtiva(false)
      setOutraPessoaConectada(false)

      let mensagemErro = "Erro ao acessar câmera."

      if (error.name === "NotAllowedError") {
        mensagemErro = "Permissão de câmera negada. Clique no ícone de câmera na barra de endereços e permita o acesso."
      } else if (error.name === "NotFoundError") {
        mensagemErro = "Câmera não encontrada. Verifique se há uma câmera conectada."
      } else if (error.name === "NotReadableError") {
        mensagemErro = "Câmera está sendo usada por outro aplicativo. Feche outros apps que usam câmera."
      }

      alert(mensagemErro)
    }
  }

  const toggleAudio = () => {
    setAudioAtivo(!audioAtivo)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioAtivo
      }
    }
  }

  const toggleCamera = () => {
    const novoEstado = !cameraAtiva
    setCameraAtiva(novoEstado)

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = novoEstado
        console.log("Câmera", novoEstado ? "ligada" : "desligada")
      }
    }
  }

  const finalizarConsulta = () => {
    if (user) {
      const tipoUsuario = user.type === "medico" ? "medico" : "paciente"
      const sucesso = sistemaConsultas.finalizarConsulta(chatId, tipoUsuario)

      if (sucesso) {
        console.log("Consulta finalizada no sistema global")
      }
    }

    // Parar streams de vídeo
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null
    }

    setVideoAtivo(false)
    setCameraAtiva(false)
    setChamadaAtiva(false)
    setConsultaFinalizada(true)
    setOutraPessoaConectada(false)

    const mensagemSistema: Mensagem = {
      id: Date.now().toString(),
      remetente: "sistema",
      conteudo: "Consulta finalizada - Obrigado por usar o Medicina para Todos!",
      timestamp: new Date(),
      tipo: "sistema",
    }
    setMensagens((prev) => [...prev, mensagemSistema])

    setTimeout(() => {
      alert(
        user?.type === "medico"
          ? "Consulta finalizada! Obrigado pelo seu trabalho voluntário."
          : "Consulta finalizada! Obrigado por usar nossos serviços.",
      )
      router.push(user?.type === "medico" ? "/dashboard/medico" : "/dashboard/paciente")
    }, 2000)
  }

  if (!user || !consulta) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isDoctor = user.type === "medico"
  const outroUsuario = isDoctor ? consulta.pacienteNome : consulta.medicoNome

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <div>
              <h1 className="text-lg font-bold text-primary">Consulta</h1>
              <p className="text-sm text-muted-foreground">{outroUsuario}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={consulta.status === "finalizada" ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"}
            >
              {consulta.status === "finalizada" ? "Finalizada" : "Ativa"}
            </Badge>
            {consulta.status !== "finalizada" && (
              <Button
                variant="outline"
                size="sm"
                onClick={finalizarConsulta}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Video Area */}
      {chamadaAtiva && (
        <div
          className={`relative bg-black transition-all duration-300 ${
            visualizacaoGrande ? "h-64 md:h-80" : "h-32 md:h-40"
          }`}
        >
          <div className="relative w-full h-full">
            {outraPessoaConectada ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <User className="h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-semibold">{outroUsuario}</h3>
                  <p className="text-sm opacity-80">Conectado</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <User className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">Aguardando {outroUsuario}...</p>
                  <p className="text-sm opacity-60">Conectando...</p>
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4 w-24 h-18 md:w-32 md:h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
              {videoAtivo && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{
                    transform: "scaleX(-1)",
                    display: cameraAtiva ? "block" : "none",
                  }}
                />
              )}
              {(!videoAtivo || !cameraAtiva) && (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <CameraOff className="h-4 w-4 text-white/50" />
                </div>
              )}
              <div className="absolute bottom-1 left-1">
                <Badge variant="secondary" className="bg-green-500/80 text-white text-xs px-1 py-0">
                  Você
                </Badge>
              </div>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/70 rounded-full p-2">
            <Button
              size="sm"
              variant={audioAtivo ? "default" : "destructive"}
              onClick={toggleAudio}
              className="rounded-full w-10 h-10 p-0"
            >
              {audioAtivo ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant={cameraAtiva ? "default" : "destructive"}
              onClick={toggleCamera}
              className="rounded-full w-10 h-10 p-0"
            >
              {cameraAtiva ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setVisualizacaoGrande(!visualizacaoGrande)}
              className="rounded-full w-10 h-10 p-0 bg-white/20 hover:bg-white/30"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={finalizarConsulta} className="rounded-full w-10 h-10 p-0">
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-16 left-4">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {visualizacaoGrande ? "Tela Grande" : "Tela Pequena"}
            </Badge>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-4 max-w-2xl mx-auto">
          {mensagens.map((mensagem) => (
            <div key={mensagem.id}>
              {mensagem.tipo === "sistema" ? (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {mensagem.conteudo}
                  </Badge>
                </div>
              ) : (
                <div
                  className={`flex gap-3 ${
                    (isDoctor && mensagem.remetente === "medico") || (!isDoctor && mensagem.remetente === "paciente")
                      ? "flex-row-reverse"
                      : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[70%] ${
                      (isDoctor && mensagem.remetente === "medico") || (!isDoctor && mensagem.remetente === "paciente")
                        ? "text-right"
                        : ""
                    }`}
                  >
                    <Card
                      className={`${
                        (isDoctor && mensagem.remetente === "medico") ||
                        (!isDoctor && mensagem.remetente === "paciente")
                          ? "bg-primary text-primary-foreground"
                          : "bg-white border-green-100"
                      }`}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm">{mensagem.conteudo}</p>
                      </CardContent>
                    </Card>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mensagem.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      {consulta.status !== "finalizada" && (
        <div className="px-4 py-4 border-t border-green-100 bg-white">
          <div className="flex gap-2 max-w-2xl mx-auto">
            {!chamadaAtiva && (
              <Button variant="outline" size="sm" onClick={handleIniciarVideo} className="flex-shrink-0 bg-transparent">
                <Video className="h-4 w-4" />
              </Button>
            )}
            <Input
              placeholder="Digite sua mensagem..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleEnviarMensagem()}
              className="flex-1"
            />
            <Button onClick={handleEnviarMensagem} disabled={!novaMensagem.trim()} className="flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
