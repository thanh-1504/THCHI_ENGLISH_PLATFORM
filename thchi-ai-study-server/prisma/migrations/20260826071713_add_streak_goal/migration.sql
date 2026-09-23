-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "goal_reward_configs" (
    "id" TEXT NOT NULL,
    "targetDays" INTEGER NOT NULL,
    "shieldReward" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_reward_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "targetDays" INTEGER NOT NULL,
    "shieldReward" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streak_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "goal_reward_configs_targetDays_key" ON "goal_reward_configs"("targetDays");

-- AddForeignKey
ALTER TABLE "streak_goals" ADD CONSTRAINT "streak_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_goals" ADD CONSTRAINT "streak_goals_configId_fkey" FOREIGN KEY ("configId") REFERENCES "goal_reward_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
