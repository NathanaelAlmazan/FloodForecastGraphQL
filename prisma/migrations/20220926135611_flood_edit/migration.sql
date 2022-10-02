/*
  Warnings:

  - You are about to drop the `FloodHostory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FloodHostory";

-- CreateTable
CREATE TABLE "FloodHistory" (
    "recordId" BIGSERIAL NOT NULL,
    "floodLevel" DOUBLE PRECISION NOT NULL,
    "precipitation" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FloodHistory_pkey" PRIMARY KEY ("recordId")
);
