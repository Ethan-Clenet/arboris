-- AlterTable
ALTER TABLE "skills" ADD COLUMN "securityRecommendation" TEXT,
ADD COLUMN "securityReportJson" TEXT NOT NULL DEFAULT 'null',
ADD COLUMN "scannedAt" TIMESTAMP(3),
ADD COLUMN "scanMode" TEXT;

-- CreateIndex
CREATE INDEX "skills_score_idx" ON "skills"("score");
