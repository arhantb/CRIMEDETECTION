-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crime_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "mediaType" "public"."MediaType" NOT NULL,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crime_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_analyses" (
    "id" TEXT NOT NULL,
    "crimeReportId" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "crimeType" TEXT NOT NULL,
    "severity" "public"."Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "riskFactors" TEXT[],
    "recommendations" TEXT[],
    "people" TEXT[],
    "vehicles" TEXT[],
    "weapons" TEXT[],
    "locations" TEXT[],
    "objects" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."human_verifications" (
    "id" TEXT NOT NULL,
    "crimeReportId" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL,
    "notes" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "human_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ai_analyses_crimeReportId_key" ON "public"."ai_analyses"("crimeReportId");

-- CreateIndex
CREATE UNIQUE INDEX "human_verifications_crimeReportId_key" ON "public"."human_verifications"("crimeReportId");

-- AddForeignKey
ALTER TABLE "public"."crime_reports" ADD CONSTRAINT "crime_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_analyses" ADD CONSTRAINT "ai_analyses_crimeReportId_fkey" FOREIGN KEY ("crimeReportId") REFERENCES "public"."crime_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."human_verifications" ADD CONSTRAINT "human_verifications_crimeReportId_fkey" FOREIGN KEY ("crimeReportId") REFERENCES "public"."crime_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."human_verifications" ADD CONSTRAINT "human_verifications_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
