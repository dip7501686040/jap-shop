-- CreateTable
CREATE TABLE "logbooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_logbooks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logbookId" TEXT NOT NULL,
    "canAdd" BOOLEAN NOT NULL DEFAULT false,
    "canRead" BOOLEAN NOT NULL DEFAULT true,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_logbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logbook_customers" (
    "id" TEXT NOT NULL,
    "logbookId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logbook_customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_logbooks_userId_logbookId_key" ON "user_logbooks"("userId", "logbookId");

-- CreateIndex
CREATE UNIQUE INDEX "logbook_customers_logbookId_customerId_key" ON "logbook_customers"("logbookId", "customerId");

-- AddForeignKey
ALTER TABLE "user_logbooks" ADD CONSTRAINT "user_logbooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_logbooks" ADD CONSTRAINT "user_logbooks_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "logbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_customers" ADD CONSTRAINT "logbook_customers_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "logbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_customers" ADD CONSTRAINT "logbook_customers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
