-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "DuplicateStrategy" AS ENUM ('SKIP', 'UPDATE', 'CREATE_NEW');

-- CreateEnum
CREATE TYPE "ImportDraftStatus" AS ENUM ('UPLOADING', 'READY', 'COMMITTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ImportRowStatus" AS ENUM ('VALID', 'WARNING', 'INVALID', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ImportRowAction" AS ENUM ('IMPORT', 'UPDATE', 'SKIP', 'INVALID');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('MEMBER_CREATED', 'MEMBER_UPDATED', 'MEMBER_DELETED', 'MEMBER_RESTORED', 'MEMBER_EXPORTED', 'FULL_EXPORT', 'EXCEL_IMPORT', 'USER_CREATED', 'USER_ROLE_CHANGED', 'USER_DISABLED', 'USER_ENABLED', 'USER_DELETED', 'PASSWORD_RESET', 'PASSWORD_CHANGED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" UUID NOT NULL,
    "sequenceNumber" INTEGER,
    "membershipCardNumber" VARCHAR(100),
    "membershipCardNormalized" VARCHAR(100),
    "surname" VARCHAR(100) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "dateOfBirth" DATE,
    "street" VARCHAR(200),
    "settlement" VARCHAR(120),
    "postalCode" VARCHAR(20),
    "postOffice" VARCHAR(120),
    "warVeteranStatus" BOOLEAN,
    "email" VARCHAR(254),
    "emailNormalized" VARCHAR(254),
    "municipality" VARCHAR(120),
    "subcommittee" VARCHAR(120),
    "membershipFeePaid" BOOLEAN,
    "vpo" VARCHAR(100),
    "identityFingerprint" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" UUID,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportDraft" (
    "id" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "sheetName" VARCHAR(255) NOT NULL,
    "columnMapping" JSONB NOT NULL,
    "duplicateStrategy" "DuplicateStrategy" NOT NULL,
    "preserveBlankValues" BOOLEAN NOT NULL DEFAULT true,
    "approvePostalWarnings" BOOLEAN NOT NULL DEFAULT false,
    "status" "ImportDraftStatus" NOT NULL DEFAULT 'UPLOADING',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID NOT NULL,

    CONSTRAINT "ImportDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportDraftRow" (
    "id" UUID NOT NULL,
    "draftId" UUID NOT NULL,
    "sourceRowNumber" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "nonEmptyFields" JSONB NOT NULL,
    "diagnostics" JSONB NOT NULL,
    "status" "ImportRowStatus" NOT NULL,
    "action" "ImportRowAction" NOT NULL,
    "duplicateMemberId" UUID,

    CONSTRAINT "ImportDraftRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "sheetName" VARCHAR(255) NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "administratorId" UUID,
    "administratorEmailSnapshot" VARCHAR(254) NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "importedRows" INTEGER NOT NULL,
    "updatedRows" INTEGER NOT NULL,
    "skippedRows" INTEGER NOT NULL,
    "invalidRows" INTEGER NOT NULL,
    "duplicateStrategy" "DuplicateStrategy" NOT NULL,
    "preserveBlankValues" BOOLEAN NOT NULL,
    "errorSummary" JSONB NOT NULL,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "actorEmailSnapshot" VARCHAR(254) NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" VARCHAR(80),
    "changedFields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "key" VARCHAR(64) NOT NULL,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "Member_surname_idx" ON "Member"("surname");

-- CreateIndex
CREATE INDEX "Member_firstName_idx" ON "Member"("firstName");

-- CreateIndex
CREATE INDEX "Member_membershipCardNumber_idx" ON "Member"("membershipCardNumber");

-- CreateIndex
CREATE INDEX "Member_membershipCardNormalized_idx" ON "Member"("membershipCardNormalized");

-- CreateIndex
CREATE INDEX "Member_emailNormalized_idx" ON "Member"("emailNormalized");

-- CreateIndex
CREATE INDEX "Member_identityFingerprint_idx" ON "Member"("identityFingerprint");

-- CreateIndex
CREATE INDEX "Member_postalCode_idx" ON "Member"("postalCode");

-- CreateIndex
CREATE INDEX "Member_postOffice_idx" ON "Member"("postOffice");

-- CreateIndex
CREATE INDEX "Member_municipality_idx" ON "Member"("municipality");

-- CreateIndex
CREATE INDEX "Member_subcommittee_idx" ON "Member"("subcommittee");

-- CreateIndex
CREATE INDEX "Member_membershipFeePaid_idx" ON "Member"("membershipFeePaid");

-- CreateIndex
CREATE INDEX "Member_warVeteranStatus_idx" ON "Member"("warVeteranStatus");

-- CreateIndex
CREATE INDEX "Member_deletedAt_idx" ON "Member"("deletedAt");

-- CreateIndex
CREATE INDEX "Member_createdAt_idx" ON "Member"("createdAt");

-- CreateIndex
CREATE INDEX "Member_updatedAt_idx" ON "Member"("updatedAt");

-- CreateIndex
CREATE INDEX "ImportDraft_createdById_status_idx" ON "ImportDraft"("createdById", "status");

-- CreateIndex
CREATE INDEX "ImportDraft_expiresAt_idx" ON "ImportDraft"("expiresAt");

-- CreateIndex
CREATE INDEX "ImportDraftRow_draftId_status_idx" ON "ImportDraftRow"("draftId", "status");

-- CreateIndex
CREATE INDEX "ImportDraftRow_draftId_action_idx" ON "ImportDraftRow"("draftId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "ImportDraftRow_draftId_sourceRowNumber_key" ON "ImportDraftRow"("draftId", "sourceRowNumber");

-- CreateIndex
CREATE INDEX "ImportBatch_importedAt_idx" ON "ImportBatch"("importedAt");

-- CreateIndex
CREATE INDEX "ImportBatch_administratorId_idx" ON "ImportBatch"("administratorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "LoginAttempt_updatedAt_idx" ON "LoginAttempt"("updatedAt");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportDraft" ADD CONSTRAINT "ImportDraft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportDraftRow" ADD CONSTRAINT "ImportDraftRow_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ImportDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_administratorId_fkey" FOREIGN KEY ("administratorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Case-insensitive substring search indexes for the highest-use member fields.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "Member_surname_trgm_idx" ON "Member" USING GIN ("surname" gin_trgm_ops);
CREATE INDEX "Member_firstName_trgm_idx" ON "Member" USING GIN ("firstName" gin_trgm_ops);
CREATE INDEX "Member_card_trgm_idx" ON "Member" USING GIN ("membershipCardNumber" gin_trgm_ops);
CREATE INDEX "Member_email_trgm_idx" ON "Member" USING GIN ("email" gin_trgm_ops);
