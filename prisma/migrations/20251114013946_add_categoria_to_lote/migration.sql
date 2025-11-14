-- AlterTable
ALTER TABLE "Lote" ADD COLUMN     "categoriaServicoId" TEXT;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_categoriaServicoId_fkey" FOREIGN KEY ("categoriaServicoId") REFERENCES "CategoriaServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
