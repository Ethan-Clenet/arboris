-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#43A047',
    "labelFr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "briefFr" TEXT NOT NULL,
    "briefEn" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'featured',
    "commandIdsJson" TEXT NOT NULL DEFAULT '[]',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CollectionToSkill_B_index" ON "_CollectionToSkill"("B");

-- AddForeignKey
ALTER TABLE "_CollectionToSkill" ADD CONSTRAINT "_CollectionToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToSkill" ADD CONSTRAINT "_CollectionToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
