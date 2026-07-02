-- Multi-artist rooms + versioned listener agreement + watermark-ready sessions.
-- NOTE: ordered so existing FanProfile.invitedByArtistId bindings are copied
-- into RoomAccess BEFORE the column is dropped.

-- CreateTable
CREATE TABLE "RoomAccess" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "invitationId" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "RoomAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ipAddress" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgreementAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomAccess_artistId_idx" ON "RoomAccess"("artistId");
CREATE UNIQUE INDEX "RoomAccess_fanId_artistId_key" ON "RoomAccess"("fanId", "artistId");
CREATE INDEX "AgreementAcceptance_userId_idx" ON "AgreementAcceptance"("userId");
CREATE UNIQUE INDEX "AgreementAcceptance_userId_version_key" ON "AgreementAcceptance"("userId", "version");

-- AddForeignKey
ALTER TABLE "RoomAccess" ADD CONSTRAINT "RoomAccess_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoomAccess" ADD CONSTRAINT "RoomAccess_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "ArtistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgreementAcceptance" ADD CONSTRAINT "AgreementAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing single-artist bindings as room access rows
INSERT INTO "RoomAccess" ("id", "fanId", "artistId")
SELECT 'ra_' || "id", "id", "invitedByArtistId"
FROM "FanProfile"
WHERE "invitedByArtistId" IS NOT NULL;

-- Drop the old single-binding column
ALTER TABLE "FanProfile" DROP CONSTRAINT "FanProfile_invitedByArtistId_fkey";
DROP INDEX "FanProfile_invitedByArtistId_idx";
ALTER TABLE "FanProfile" DROP COLUMN "invitedByArtistId";

-- Watermark-ready playback sessions
ALTER TABLE "ListeningSession" ADD COLUMN "deviceId" TEXT;
