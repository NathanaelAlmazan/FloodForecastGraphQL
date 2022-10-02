-- CreateTable
CREATE TABLE "FloodHostory" (
    "recordId" BIGSERIAL NOT NULL,
    "floodLevel" DOUBLE PRECISION NOT NULL,
    "precipitation" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FloodHostory_pkey" PRIMARY KEY ("recordId")
);
