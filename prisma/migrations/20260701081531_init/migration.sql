-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labelFr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "stacks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "briefFr" TEXT NOT NULL,
    "briefEn" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "icon" TEXT NOT NULL,
    "score" INTEGER,
    "tagFr" TEXT NOT NULL,
    "tagEn" TEXT NOT NULL,
    "actFr" TEXT NOT NULL,
    "actEn" TEXT NOT NULL,
    "techJson" TEXT NOT NULL DEFAULT '[]',
    "compatJson" TEXT NOT NULL DEFAULT '[]',
    "doesFrJson" TEXT NOT NULL DEFAULT '[]',
    "doesEnJson" TEXT NOT NULL DEFAULT '[]',
    "triggersFrJson" TEXT NOT NULL DEFAULT '[]',
    "triggersEnJson" TEXT NOT NULL DEFAULT '[]',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "skills_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SkillToStack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SkillToStack_A_fkey" FOREIGN KEY ("A") REFERENCES "skills" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SkillToStack_B_fkey" FOREIGN KEY ("B") REFERENCES "stacks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "skills_categoryId_idx" ON "skills"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "_SkillToStack_AB_unique" ON "_SkillToStack"("A", "B");

-- CreateIndex
CREATE INDEX "_SkillToStack_B_index" ON "_SkillToStack"("B");
