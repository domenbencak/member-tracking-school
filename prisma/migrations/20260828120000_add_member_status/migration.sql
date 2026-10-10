-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('DECEASED', 'RESIGNED', 'OTHER');

-- AlterTable
ALTER TABLE "Member"
ADD COLUMN "memberStatus" "MemberStatus" NOT NULL DEFAULT 'OTHER',
ADD COLUMN "statusChangedAt" DATE,
ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE INDEX "Member_memberStatus_idx" ON "Member"("memberStatus");

-- CreateIndex
CREATE INDEX "Member_statusChangedAt_idx" ON "Member"("statusChangedAt");
