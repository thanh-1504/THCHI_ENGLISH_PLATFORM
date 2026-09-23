/*
  Warnings:

  - The `paymentGateway` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('VNPAY', 'MOMO', 'ZALOPAY', 'STRIPE', 'PAYPAL');

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "paymentGateway",
ADD COLUMN     "paymentGateway" "PaymentGateway";
