/*
  Warnings:

  - Made the column `categoryId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Auction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startPrice" INTEGER NOT NULL,
    "currentPrice" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'SA',
    "city" TEXT NOT NULL DEFAULT 'Riyadh',
    "durationDays" INTEGER NOT NULL DEFAULT 3,
    "itemsCount" INTEGER NOT NULL DEFAULT 1,
    "hijriDateLabel" TEXT,
    "gregorianDateLabel" TEXT,
    "startDayTimeLabel" TEXT,
    "auctionTypeLabel" TEXT,
    "badgeLabel" TEXT,
    "auctionTypeLabelAr" TEXT,
    "auctionTypeLabelEn" TEXT,
    "badgeLabelAr" TEXT,
    "badgeLabelEn" TEXT,
    "badgeCount" INTEGER,
    "companyName" TEXT,
    "companyLogoUrl" TEXT,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    CONSTRAINT "Auction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Auction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Auction" ("auctionTypeLabel", "auctionTypeLabelAr", "auctionTypeLabelEn", "badgeCount", "badgeLabel", "badgeLabelAr", "badgeLabelEn", "city", "companyLogoUrl", "companyName", "createdAt", "currentPrice", "durationDays", "endsAt", "gregorianDateLabel", "hijriDateLabel", "id", "itemsCount", "productId", "sellerId", "startDayTimeLabel", "startPrice", "startsAt", "status", "updatedAt") SELECT "auctionTypeLabel", "auctionTypeLabelAr", "auctionTypeLabelEn", "badgeCount", "badgeLabel", "badgeLabelAr", "badgeLabelEn", "city", "companyLogoUrl", "companyName", "createdAt", "currentPrice", "durationDays", "endsAt", "gregorianDateLabel", "hijriDateLabel", "id", "itemsCount", "productId", "sellerId", "startDayTimeLabel", "startPrice", "startsAt", "status", "updatedAt" FROM "Auction";
DROP TABLE "Auction";
ALTER TABLE "new_Auction" RENAME TO "Auction";
CREATE UNIQUE INDEX "Auction_productId_key" ON "Auction"("productId");
CREATE INDEX "Auction_status_endsAt_idx" ON "Auction"("status", "endsAt");
CREATE INDEX "Auction_sellerId_createdAt_idx" ON "Auction"("sellerId", "createdAt");
CREATE INDEX "Auction_createdAt_idx" ON "Auction"("createdAt");
CREATE INDEX "Auction_countryCode_city_idx" ON "Auction"("countryCode", "city");
CREATE INDEX "Auction_badgeLabel_idx" ON "Auction"("badgeLabel");
CREATE INDEX "Auction_badgeLabelAr_idx" ON "Auction"("badgeLabelAr");
CREATE INDEX "Auction_badgeLabelEn_idx" ON "Auction"("badgeLabelEn");
CREATE INDEX "Auction_auctionTypeLabel_idx" ON "Auction"("auctionTypeLabel");
CREATE INDEX "Auction_auctionTypeLabelAr_idx" ON "Auction"("auctionTypeLabelAr");
CREATE INDEX "Auction_auctionTypeLabelEn_idx" ON "Auction"("auctionTypeLabelEn");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "createdAt", "description", "id", "imageUrl", "ownerId", "title", "updatedAt") SELECT "categoryId", "createdAt", "description", "id", "imageUrl", "ownerId", "title", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_ownerId_idx" ON "Product"("ownerId");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
