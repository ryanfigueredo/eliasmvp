-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "categoriaServicoId" TEXT;

-- CreateTable
CREATE TABLE "CategoriaServico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "CategoriaServico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaServico_nome_ownerId_key" ON "CategoriaServico"("nome", "ownerId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_categoriaServicoId_fkey" FOREIGN KEY ("categoriaServicoId") REFERENCES "CategoriaServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaServico" ADD CONSTRAINT "CategoriaServico_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Criar categoria padrão "Limpa Nome" para cada master existente
INSERT INTO "CategoriaServico" ("id", "nome", "descricao", "ativo", "createdAt", "updatedAt", "ownerId")
SELECT 
    gen_random_uuid()::text as "id",
    'Limpa Nome' as "nome",
    'Serviço padrão de limpeza de nome' as "descricao",
    true as "ativo",
    NOW() as "createdAt",
    NOW() as "updatedAt",
    "id" as "ownerId"
FROM "User"
WHERE "role" = 'master';

-- Atualizar todos os documentos existentes para usar a categoria "Limpa Nome" do respectivo master
UPDATE "Document" d
SET "categoriaServicoId" = (
    SELECT cs."id"
    FROM "CategoriaServico" cs
    WHERE cs."nome" = 'Limpa Nome'
    AND cs."ownerId" = (
        CASE 
            WHEN u."role" = 'master' THEN u."id"
            ELSE u."ownerId"
        END
    )
    LIMIT 1
)
FROM "User" u
WHERE d."userId" = u."id"
AND d."categoriaServicoId" IS NULL;
