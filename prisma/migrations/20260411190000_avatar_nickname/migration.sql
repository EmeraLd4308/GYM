-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarId" VARCHAR(32) NOT NULL DEFAULT 'barbell';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "nickname" VARCHAR(40);
