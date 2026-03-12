-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('INCOME', 'SAVINGS');

-- CreateEnum
CREATE TYPE "SavingDestinationType" AS ENUM ('GENERAL', 'PROJECT');

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "category" "TagCategory" NOT NULL,
    "isSystemTag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tag_userId_category_idx" ON "Tag"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_code_category_key" ON "Tag"("userId", "code", "category");

-- AlterTable
ALTER TABLE "Income" ADD COLUMN "tagId" TEXT;

-- AlterTable
ALTER TABLE "Saving"
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "destinationType" "SavingDestinationType" NOT NULL DEFAULT 'GENERAL',
    ADD COLUMN "projectId" TEXT,
    ADD COLUMN "tagId" TEXT,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Seed system tags from Month.userId
WITH user_ids AS (
  SELECT DISTINCT "userId" FROM "Month"
)
INSERT INTO "Tag" ("id", "userId", "code", "label", "category", "isSystemTag", "createdAt", "updatedAt")
SELECT
  'tag_' || md5(user_ids."userId" || ':OTHER:INCOME'),
  user_ids."userId",
  'OTHER',
  NULL,
  'INCOME'::"TagCategory",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM user_ids
ON CONFLICT ("userId", "code", "category") DO NOTHING;

WITH user_ids AS (
  SELECT DISTINCT "userId" FROM "Month"
)
INSERT INTO "Tag" ("id", "userId", "code", "label", "category", "isSystemTag", "createdAt", "updatedAt")
SELECT
  'tag_' || md5(user_ids."userId" || ':AJO_PAYOUT:SAVINGS'),
  user_ids."userId",
  'AJO_PAYOUT',
  NULL,
  'SAVINGS'::"TagCategory",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM user_ids
ON CONFLICT ("userId", "code", "category") DO NOTHING;

WITH user_ids AS (
  SELECT DISTINCT "userId" FROM "Month"
)
INSERT INTO "Tag" ("id", "userId", "code", "label", "category", "isSystemTag", "createdAt", "updatedAt")
SELECT
  'tag_' || md5(user_ids."userId" || ':AJO_CONTRIBUTION:SAVINGS'),
  user_ids."userId",
  'AJO_CONTRIBUTION',
  NULL,
  'SAVINGS'::"TagCategory",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM user_ids
ON CONFLICT ("userId", "code", "category") DO NOTHING;

WITH user_ids AS (
  SELECT DISTINCT "userId" FROM "Month"
)
INSERT INTO "Tag" ("id", "userId", "code", "label", "category", "isSystemTag", "createdAt", "updatedAt")
SELECT
  'tag_' || md5(user_ids."userId" || ':OTHER:SAVINGS'),
  user_ids."userId",
  'OTHER',
  NULL,
  'SAVINGS'::"TagCategory",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM user_ids
ON CONFLICT ("userId", "code", "category") DO NOTHING;

-- Backfill existing savings to GENERAL destination with savings tags
UPDATE "Saving" AS s
SET
  "destinationType" = 'GENERAL'::"SavingDestinationType",
  "tagId" = CASE
    WHEN s."category" = 'AJO' THEN 'tag_' || md5(m."userId" || ':AJO_CONTRIBUTION:SAVINGS')
    WHEN s."category" = 'OTHER' THEN 'tag_' || md5(m."userId" || ':OTHER:SAVINGS')
    ELSE NULL
  END,
  "projectId" = NULL,
  "updatedAt" = CURRENT_TIMESTAMP
FROM "Month" AS m
WHERE s."monthId" = m."id"
  AND s."tagId" IS NULL;

-- Backfill existing incomes to the fallback income tag
UPDATE "Income" AS i
SET "tagId" = 'tag_' || md5(m."userId" || ':OTHER:INCOME')
FROM "Month" AS m
WHERE i."monthId" = m."id"
  AND i."tagId" IS NULL;

-- Remap project statuses safely
BEGIN;
ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PAUSED', 'READY', 'COMPLETED');

ALTER TABLE "Project"
ALTER COLUMN "status" TYPE "ProjectStatus"
USING (
  CASE "status"::text
    WHEN 'PLANNED' THEN 'PENDING'
    WHEN 'ONGOING' THEN 'IN_PROGRESS'
    WHEN 'COMPLETED' THEN 'COMPLETED'
  END
)::"ProjectStatus";

DROP TYPE "ProjectStatus_old";
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- Align temporary defaults with the Prisma schema
ALTER TABLE "Saving" ALTER COLUMN "destinationType" DROP DEFAULT;
ALTER TABLE "Saving" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Income_tagId_idx" ON "Income"("tagId");

-- CreateIndex
CREATE INDEX "Saving_monthId_idx" ON "Saving"("monthId");

-- CreateIndex
CREATE INDEX "Saving_tagId_idx" ON "Saving"("tagId");

-- CreateIndex
CREATE INDEX "Saving_projectId_idx" ON "Saving"("projectId");

-- CreateIndex
CREATE INDEX "Saving_destinationType_idx" ON "Saving"("destinationType");

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddConstraint
ALTER TABLE "Saving"
ADD CONSTRAINT "Saving_destination_project_check"
CHECK (
  ("destinationType" = 'GENERAL' AND "projectId" IS NULL)
  OR
  ("destinationType" = 'PROJECT' AND "projectId" IS NOT NULL)
);

-- Drop legacy savings classification after backfill
ALTER TABLE "Saving" DROP COLUMN "category";

-- DropEnum
DROP TYPE "SavingCategory";
