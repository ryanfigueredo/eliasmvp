-- DropForeignKey
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_userId_fkey";

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
