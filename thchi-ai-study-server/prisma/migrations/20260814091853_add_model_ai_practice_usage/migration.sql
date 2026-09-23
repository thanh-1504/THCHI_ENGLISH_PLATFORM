-- CreateTable
CREATE TABLE "ai_practice_usages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usageDate" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_practice_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_practice_usages_userId_usageDate_key" ON "ai_practice_usages"("userId", "usageDate");

-- AddForeignKey
ALTER TABLE "ai_practice_usages" ADD CONSTRAINT "ai_practice_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
