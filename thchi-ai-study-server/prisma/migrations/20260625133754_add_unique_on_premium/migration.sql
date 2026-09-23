/*
  Warnings:

  - A unique constraint covering the columns `[name,duration]` on the table `premium_plans` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "premium_plans_name_duration_key" ON "premium_plans"("name", "duration");
