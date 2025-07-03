/*
  Warnings:

  - Added the required column `updatedAt` to the `role_menus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "role_menus" ADD COLUMN     "canAdd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canUpdate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
