'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, FileWarning, Download } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PreviewDocumentoModal({
  fileUrl,
}: {
  fileUrl: string
}) {
  const [open, setOpen] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string>('')

  const supportedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp']

  const fileExtension = fileUrl.split('.').pop()?.toLowerCase() || ''
  const isSupported = supportedExtensions.some((ext) =>
    fileUrl.toLowerCase().endsWith(ext),
  )

  useEffect(() => {
    if (open) {
      const fetchUrl = async () => {
        try {
          const key = fileUrl.startsWith('http')
            ? fileUrl.replace(/^https?:\/\/[^\/]+\/+/i, '')
            : fileUrl

          const res = await fetch(
            `/api/document/get-url?key=${encodeURIComponent(key)}`,
          )
          const data = await res.json()
          setSignedUrl(data.url)
        } catch (error) {
          console.error(error)
        }
      }

      fetchUrl()
    } else {
      setSignedUrl('')
    }
  }, [open, fileUrl])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs flex gap-2 items-center">
          <Eye className="w-4 h-4" />
          Ver documento
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col h-[90vh] w-full max-w-3xl bg-white rounded-xl overflow-hidden px-0 py-0">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="text-lg">
            Visualização do Documento
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 w-full h-full overflow-hidden">
          {signedUrl ? (
            isSupported ? (
              <iframe
                src={signedUrl}
                className="w-full h-full border rounded-md shadow-sm"
                title="Visualização do Documento"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-sm text-zinc-500">
                <FileWarning className="w-10 h-10 mb-3 text-zinc-400" />
                <p>Este tipo de arquivo não pode ser exibido diretamente.</p>
                <a
                  href={signedUrl}
                  download
                  className="mt-4 inline-flex items-center gap-2 text-white bg-[#9C66FF] hover:bg-[#8450e6] px-4 py-2 rounded-md text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Baixar Documento
                </a>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-zinc-500">
              Carregando...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
