-- CreateEnum
CREATE TYPE "Orgao" AS ENUM ('CENPROT', 'SPC', 'SERASA', 'BOA_VISTA');

-- CreateEnum
CREATE TYPE "DocumentoStatus" AS ENUM ('INICIADO', 'EM_ANDAMENTO', 'FINALIZADO');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clienteId" TEXT,
    "orgao" "Orgao" NOT NULL,
    "status" "DocumentoStatus" NOT NULL DEFAULT 'INICIADO',
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
