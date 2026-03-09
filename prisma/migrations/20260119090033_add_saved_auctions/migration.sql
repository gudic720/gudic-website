-- CreateTable
CREATE TABLE "SavedAuction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedAuction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedAuction_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SavedAuction_userId_createdAt_idx" ON "SavedAuction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedAuction_auctionId_idx" ON "SavedAuction"("auctionId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedAuction_userId_auctionId_key" ON "SavedAuction"("userId", "auctionId");
