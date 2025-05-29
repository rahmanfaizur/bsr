/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contact_phoneNumber_key" ON "Contact"("phoneNumber");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_phoneNumber_idx" ON "Contact"("phoneNumber");

-- CreateIndex
CREATE INDEX "Contact_linkedId_idx" ON "Contact"("linkedId");
