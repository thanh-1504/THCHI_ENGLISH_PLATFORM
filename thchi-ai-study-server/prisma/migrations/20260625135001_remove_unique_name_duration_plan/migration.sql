/*
  Warnings:

  - A unique constraint covering the columns `[duration]` on the table `premium_plans` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "premium_plans_name_duration_key";

-- AlterTable
ALTER TABLE "premium_plans" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "originalPrice" DECIMAL(12,2);

-- CreateIndex
CREATE UNIQUE INDEX "premium_plans_duration_key" ON "premium_plans"("duration");
