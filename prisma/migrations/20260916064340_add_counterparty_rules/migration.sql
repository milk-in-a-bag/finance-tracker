-- CreateTable
CREATE TABLE "CounterpartyRule" (
    "id" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CounterpartyRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CounterpartyRule_counterparty_key" ON "CounterpartyRule"("counterparty");

-- AddForeignKey
ALTER TABLE "CounterpartyRule" ADD CONSTRAINT "CounterpartyRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
