/*
  Warnings:

  - The values [MOMO] on the enum `PaymentGateway` will be removed. If these variants are still used in the database, this will fail.
  - The values [ONE_MONTH] on the enum `PremiumDuration` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bio` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the `achievements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin_audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_quiz_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `email_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goal_commitments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_achievements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `word_mnemonics` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGateway_new" AS ENUM ('VNPAY');
ALTER TABLE "transactions" ALTER COLUMN "paymentGateway" TYPE "PaymentGateway_new" USING ("paymentGateway"::text::"PaymentGateway_new");
ALTER TYPE "PaymentGateway" RENAME TO "PaymentGateway_old";
ALTER TYPE "PaymentGateway_new" RENAME TO "PaymentGateway";
DROP TYPE "public"."PaymentGateway_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PremiumDuration_new" AS ENUM ('THREE_MONTHS', 'ONE_YEAR');
ALTER TABLE "premium_plans" ALTER COLUMN "duration" TYPE "PremiumDuration_new" USING ("duration"::text::"PremiumDuration_new");
ALTER TYPE "PremiumDuration" RENAME TO "PremiumDuration_old";
ALTER TYPE "PremiumDuration_new" RENAME TO "PremiumDuration";
DROP TYPE "public"."PremiumDuration_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ai_quiz_logs" DROP CONSTRAINT "ai_quiz_logs_learningSessionId_fkey";

-- DropForeignKey
ALTER TABLE "ai_quiz_logs" DROP CONSTRAINT "ai_quiz_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "ai_quiz_logs" DROP CONSTRAINT "ai_quiz_logs_wordId_fkey";

-- DropForeignKey
ALTER TABLE "goal_commitments" DROP CONSTRAINT "goal_commitments_userId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_postId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_userId_fkey";

-- DropForeignKey
ALTER TABLE "word_mnemonics" DROP CONSTRAINT "word_mnemonics_wordId_fkey";

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "bio";

-- DropTable
DROP TABLE "achievements";

-- DropTable
DROP TABLE "admin_audit_logs";

-- DropTable
DROP TABLE "ai_quiz_logs";

-- DropTable
DROP TABLE "email_logs";

-- DropTable
DROP TABLE "goal_commitments";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "user_achievements";

-- DropTable
DROP TABLE "word_mnemonics";
