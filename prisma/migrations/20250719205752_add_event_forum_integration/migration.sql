-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ForumPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "anonymousHandle" TEXT,
    "categoryId" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "eventId" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dealSize" TEXT,
    "location" TEXT,
    "mediaType" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ForumCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ForumPost_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ForumPost" ("anonymousHandle", "authorId", "bookmarks", "categoryId", "content", "createdAt", "dealSize", "downvotes", "id", "isAnonymous", "isFeatured", "isLocked", "isPinned", "lastActivityAt", "location", "mediaType", "slug", "tags", "title", "updatedAt", "upvotes", "urgency", "views") SELECT "anonymousHandle", "authorId", "bookmarks", "categoryId", "content", "createdAt", "dealSize", "downvotes", "id", "isAnonymous", "isFeatured", "isLocked", "isPinned", "lastActivityAt", "location", "mediaType", "slug", "tags", "title", "updatedAt", "upvotes", "urgency", "views" FROM "ForumPost";
DROP TABLE "ForumPost";
ALTER TABLE "new_ForumPost" RENAME TO "ForumPost";
CREATE UNIQUE INDEX "ForumPost_slug_key" ON "ForumPost"("slug");
CREATE INDEX "ForumPost_categoryId_idx" ON "ForumPost"("categoryId");
CREATE INDEX "ForumPost_authorId_idx" ON "ForumPost"("authorId");
CREATE INDEX "ForumPost_eventId_idx" ON "ForumPost"("eventId");
CREATE INDEX "ForumPost_createdAt_idx" ON "ForumPost"("createdAt");
CREATE INDEX "ForumPost_lastActivityAt_idx" ON "ForumPost"("lastActivityAt");
CREATE INDEX "ForumPost_urgency_idx" ON "ForumPost"("urgency");
CREATE INDEX "ForumPost_location_idx" ON "ForumPost"("location");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
