'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, FileWarning } from 'lucide-react'
import { useState } from 'react'

export default function PreviewDocumentoModal({
  fileUrl,
}: {
  fileUrl: string
}) {
  const [open, setOpen] = useState(false)

  const supportedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp']
  const fileExtension = fileUrl.split('.').pop()?.toLowerCase() || ''

  const isSupported = supportedExtensions.some((ext) =>
    fileUrl.toLowerCase().endsWith(ext),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs flex gap-2 items-center">
          <Eye className="w-4 h-4" />
          Ver documento
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-3xl h-[80vh] bg-white rounded-xl overflow-hidden px-0 py-0">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="text-lg">
            Visualização do documento
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 w-full h-full overflow-hidden p-4">
          {isSupported ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border rounded-md shadow-sm"
              title="Visualização do Documento"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-sm text-zinc-500">
              <FileWarning className="w-10 h-10 mb-3 text-zinc-400" />
              <p>Este tipo de arquivo não pode ser exibido diretamente.</p>
              <p className="mt-1">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Clique aqui para baixar o documento
                </a>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
