-- CreateTable
CREATE TABLE "public"."VocabularyCollection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VocabularyCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CollectionDetail" (
    "id" SERIAL NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,

    CONSTRAINT "CollectionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCollectionProcess" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserCollectionProcess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollectionDetail_wordId_idx" ON "public"."CollectionDetail"("wordId");

-- CreateIndex
CREATE INDEX "CollectionDetail_collectionId_idx" ON "public"."CollectionDetail"("collectionId");

-- CreateIndex
CREATE INDEX "UserCollectionProcess_userId_idx" ON "public"."UserCollectionProcess"("userId");

-- CreateIndex
CREATE INDEX "UserCollectionProcess_collectionId_idx" ON "public"."UserCollectionProcess"("collectionId");
