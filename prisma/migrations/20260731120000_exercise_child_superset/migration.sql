-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN "parentId" TEXT,
ADD COLUMN "supersetGroup" TEXT;

-- CreateIndex
CREATE INDEX "WorkoutExercise_parentId_idx" ON "WorkoutExercise"("parentId");

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
