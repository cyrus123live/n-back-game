-- AlterTable: Add adaptive fields to Session
ALTER TABLE "Session" ADD COLUMN "adaptive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Session" ADD COLUMN "startingLevel" INTEGER;
ALTER TABLE "Session" ADD COLUMN "endingLevel" INTEGER;
ALTER TABLE "Session" ADD COLUMN "levelChanges" JSONB;

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "currentDay" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "completedSessions" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingProgram_userId_idx" ON "TrainingProgram"("userId");

-- AddForeignKey
ALTER TABLE "TrainingProgram" ADD CONSTRAINT "TrainingProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
