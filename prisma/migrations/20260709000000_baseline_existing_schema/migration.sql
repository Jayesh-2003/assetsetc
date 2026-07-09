-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "slack_id" TEXT,
    "mobile_number" TEXT,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoteWorkStatus" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RemoteWorkStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT,
    "assetType" TEXT NOT NULL,
    "serialNumber" TEXT,
    "model" TEXT,
    "description" TEXT,
    "specsRam" TEXT,
    "specsHdd" TEXT,
    "specsOs" TEXT,
    "costInr" DOUBLE PRECISION,
    "costEur" DOUBLE PRECISION,
    "procurementSource" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairHistory" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "repairDate" TIMESTAMP(3) NOT NULL,
    "issue" TEXT NOT NULL,
    "vendor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "costInr" DOUBLE PRECISION,
    "costEur" DOUBLE PRECISION,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISubscriptionRegister" (
    "id" TEXT NOT NULL,
    "planIdentifier" TEXT,
    "subscriptionName" TEXT NOT NULL,
    "subscriptionTier" TEXT,
    "url" TEXT,
    "renewalDate" TIMESTAMP(3),
    "costInr" DOUBLE PRECISION,
    "costEur" DOUBLE PRECISION,
    "procurementSource" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AISubscriptionRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "assignedDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "AssetAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISubscriptionAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "assignedDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokensExhaustedDatetime" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "AISubscriptionAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingPermit" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "ParkingPermit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAssignmentArchive" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "assignedDatetime" TIMESTAMP(3) NOT NULL,
    "returnedDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "AssetAssignmentArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISubscriptionAssignmentArchive" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "assignedDatetime" TIMESTAMP(3) NOT NULL,
    "tokensExhaustedDatetime" TIMESTAMP(3),
    "returnedDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "AISubscriptionAssignmentArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingPermitArchive" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "archivedDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "ParkingPermitArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldData" TEXT,
    "newData" TEXT,
    "changedByEmployeeId" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE INDEX "RepairHistory_assetId_idx" ON "RepairHistory"("assetId");

-- CreateIndex
CREATE INDEX "RepairHistory_repairDate_idx" ON "RepairHistory"("repairDate");

-- AddForeignKey
ALTER TABLE "RemoteWorkStatus" ADD CONSTRAINT "RemoteWorkStatus_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairHistory" ADD CONSTRAINT "RepairHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISubscriptionAssignment" ADD CONSTRAINT "AISubscriptionAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISubscriptionAssignment" ADD CONSTRAINT "AISubscriptionAssignment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "AISubscriptionRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingPermit" ADD CONSTRAINT "ParkingPermit_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignmentArchive" ADD CONSTRAINT "AssetAssignmentArchive_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignmentArchive" ADD CONSTRAINT "AssetAssignmentArchive_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISubscriptionAssignmentArchive" ADD CONSTRAINT "AISubscriptionAssignmentArchive_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISubscriptionAssignmentArchive" ADD CONSTRAINT "AISubscriptionAssignmentArchive_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "AISubscriptionRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingPermitArchive" ADD CONSTRAINT "ParkingPermitArchive_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_changedByEmployeeId_fkey" FOREIGN KEY ("changedByEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

