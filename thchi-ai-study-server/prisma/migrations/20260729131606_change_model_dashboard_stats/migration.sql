/*
  Warnings:

  - A unique constraint covering the columns `[statDate]` on the table `dashboard_stats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `statDate` to the `dashboard_stats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dashboard_stats" ADD COLUMN     "statDate" DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_stats_statDate_key" ON "dashboard_stats"("statDate");
