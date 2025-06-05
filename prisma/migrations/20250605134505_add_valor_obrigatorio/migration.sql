/*
  Warnings:

  - Made the column `valor` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "valor" SET NOT NULL;
