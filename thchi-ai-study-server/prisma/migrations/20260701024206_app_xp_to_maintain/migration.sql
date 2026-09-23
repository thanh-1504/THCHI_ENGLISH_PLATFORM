/*
  Warnings:

  - Added the required column `xpToMaintain` to the `rank_tier_configs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rank_tier_configs" ADD COLUMN     "xpToMaintain" INTEGER NOT NULL;
