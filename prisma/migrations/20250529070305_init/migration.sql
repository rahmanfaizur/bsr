/*
  Warnings:

  - The `linkPrecedence` column on the `Contact` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LinkPrecedence" AS ENUM ('primary', 'secondary');

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "linkPrecedence",
ADD COLUMN     "linkPrecedence" "LinkPrecedence" NOT NULL DEFAULT 'primary';
