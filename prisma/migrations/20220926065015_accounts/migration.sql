-- CreateTable
CREATE TABLE "Account" (
    "accountId" BIGSERIAL NOT NULL,
    "accountUid" VARCHAR(20) NOT NULL,
    "firstName" VARCHAR(20) NOT NULL,
    "lastName" VARCHAR(20) NOT NULL,
    "address" VARCHAR(30) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "telephone" VARCHAR(10) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountUid_key" ON "Account"("accountUid");
