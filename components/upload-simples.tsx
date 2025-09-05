"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X } from "lucide-react"

interface ArquivoAnexado {
  id: string
  nome: string
  tipo: string
  tamanho: number
  url: string
}

interface UploadSimplesProps {
  onArquivosChange: (arquivos: ArquivoAnexado[]) => void
  arquivosExistentes?: ArquivoAnexado[]
}

export function UploadSimples({ onArquivosChange, arquivosExistentes = [] }: UploadSimplesProps) {
  const [arquivos, setArquivos] = useState<ArquivoAnexado[]>(arquivosExistentes)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const novosArquivos: ArquivoAnexado[] = []

    for (const file of Array.from(files)) {
      // Converter arquivo para base64 para persistência
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      novosArquivos.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        url: base64, // Salvar como base64 em vez de blob URL
      })
    }

    const arquivosAtualizados = [...arquivos, ...novosArquivos]
    setArquivos(arquivosAtualizados)
    onArquivosChange(arquivosAtualizados)
  }

  const removerArquivo = (id: string) => {
    const arquivosAtualizados = arquivos.filter((arquivo) => arquivo.id !== id)
    setArquivos(arquivosAtualizados)
    onArquivosChange(arquivosAtualizados)
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
      <div className="flex items-center gap-2">
        <Input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("file-upload")?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Anexar Arquivo
        </Button>
      </div>

      {arquivos.length > 0 && (
        <div className="space-y-2">
          {arquivos.map((arquivo) => (
            <Card key={arquivo.id} className="p-2">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{arquivo.nome}</p>
                      <p className="text-xs text-muted-foreground">{formatarTamanho(arquivo.tamanho)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerArquivo(arquivo.id)}
                    className="h-6 w-6 p-0"
                  >
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
