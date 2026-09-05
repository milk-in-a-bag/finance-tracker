-- CreateTable
CREATE TABLE "UnparsedMessage" (
    "id" TEXT NOT NULL,
    "rawSms" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UnparsedMessage_pkey" PRIMARY KEY ("id")
);
