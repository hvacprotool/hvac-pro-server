-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "entitlements" TEXT[] DEFAULT ARRAY[]::TEXT[];
