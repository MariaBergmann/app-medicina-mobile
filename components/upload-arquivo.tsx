"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, ImageIcon, X } from "lucide-react"

interface ArquivoUpload {
  id: string
  nome: string
  tipo: string
  tamanho: number
  url: string
}

interface UploadArquivoProps {
  onArquivoEnviado: (arquivo: ArquivoUpload) => void
}

export function UploadArquivo({ onArquivoEnviado }: UploadArquivoProps) {
  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)

    for (const file of Array.from(files)) {
      // Validar tipo e tamanho
      if (file.size > 10 * 1024 * 1024) {
        // 10MB max
        alert(`Arquivo ${file.name} é muito grande. Máximo 10MB.`)
        continue
      }

      // Simular upload (em produção, enviaria para servidor)
      const arquivo: ArquivoUpload = {
        id: Date.now().toString() + Math.random(),
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        url: URL.createObjectURL(file),
      }

      setArquivos((prev) => [...prev, arquivo])
      onArquivoEnviado(arquivo)
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removerArquivo = (id: string) => {
    setArquivos((prev) => prev.filter((arquivo) => arquivo.id !== id))
  }

  const formatarTamanho = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? "Enviando..." : "Anexar Arquivo"}
      </Button>

      {arquivos.length > 0 && (
        <div className="space-y-2">
          {arquivos.map((arquivo) => (
            <Card key={arquivo.id} className="p-2">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {arquivo.tipo.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                    ) : (
                      <File className="h-4 w-4 text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{arquivo.nome}</p>
                      <p className="text-xs text-muted-foreground">{formatarTamanho(arquivo.tamanho)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removerArquivo(arquivo.id)} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
