-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_createdById_fkey";

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "googlePlaceId" TEXT,
ADD COLUMN     "googleRating" DOUBLE PRECISION,
ADD COLUMN     "googleReviewCount" INTEGER,
ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_googlePlaceId_key" ON "Restaurant"("googlePlaceId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

