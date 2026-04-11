-- CreateTable
CREATE TABLE "ProfileSbdMaxSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "squatKg" DECIMAL(12,4),
    "benchKg" DECIMAL(12,4),
    "deadliftKg" DECIMAL(12,4),

    CONSTRAINT "ProfileSbdMaxSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileSbdMaxSnapshot_userId_recordedAt_idx" ON "ProfileSbdMaxSnapshot"("userId", "recordedAt");

-- AddForeignKey
ALTER TABLE "ProfileSbdMaxSnapshot" ADD CONSTRAINT "ProfileSbdMaxSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
