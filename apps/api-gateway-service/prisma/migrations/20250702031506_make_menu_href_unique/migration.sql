/*
  Warnings:

  - A unique constraint covering the columns `[href]` on the table `menus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "menus_href_key" ON "menus"("href");
