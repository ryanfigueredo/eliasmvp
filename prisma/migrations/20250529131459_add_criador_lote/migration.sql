-- AlterTable
ALTER TABLE "Lote" ADD COLUMN     "criadoPorId" TEXT;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
