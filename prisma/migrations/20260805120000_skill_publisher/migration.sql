-- AlterTable
ALTER TABLE "skills" ADD COLUMN "publisher" TEXT;

-- CreateIndex
CREATE INDEX "skills_publisher_idx" ON "skills"("publisher");
