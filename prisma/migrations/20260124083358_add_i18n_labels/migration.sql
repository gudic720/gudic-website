-- AlterTable
ALTER TABLE "Auction" ADD COLUMN "auctionTypeLabelAr" TEXT;
ALTER TABLE "Auction" ADD COLUMN "auctionTypeLabelEn" TEXT;
ALTER TABLE "Auction" ADD COLUMN "badgeLabelAr" TEXT;
ALTER TABLE "Auction" ADD COLUMN "badgeLabelEn" TEXT;

-- CreateIndex
CREATE INDEX "Auction_badgeLabel_idx" ON "Auction"("badgeLabel");

-- CreateIndex
CREATE INDEX "Auction_badgeLabelAr_idx" ON "Auction"("badgeLabelAr");

-- CreateIndex
CREATE INDEX "Auction_badgeLabelEn_idx" ON "Auction"("badgeLabelEn");

-- CreateIndex
CREATE INDEX "Auction_auctionTypeLabel_idx" ON "Auction"("auctionTypeLabel");

-- CreateIndex
CREATE INDEX "Auction_auctionTypeLabelAr_idx" ON "Auction"("auctionTypeLabelAr");

-- CreateIndex
CREATE INDEX "Auction_auctionTypeLabelEn_idx" ON "Auction"("auctionTypeLabelEn");
