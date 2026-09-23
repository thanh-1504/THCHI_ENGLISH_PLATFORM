/*
  Warnings:

  - A unique constraint covering the columns `[email,type]` on the table `otp_codes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "otp_codes_email_type_key" ON "otp_codes"("email", "type");
