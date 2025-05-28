-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
