/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Lote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lote_nome_key" ON "Lote"("nome");
