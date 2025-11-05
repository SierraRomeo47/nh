-- CreateEnum
CREATE TYPE "VoyageType" AS ENUM ('COMMERCIAL', 'BALLAST');

-- CreateEnum
CREATE TYPE "ImportSource" AS ENUM ('MRV_SYSTEM', 'MANUAL');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'CONDITIONAL');

-- CreateEnum
CREATE TYPE "AllocationType" AS ENUM ('OUTFLOW', 'INFLOW');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('FORECAST', 'HEDGE', 'SURRENDER', 'RECONCILE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('EMISSION_RECORDED', 'VERIFICATION_COMPLETED', 'BALANCE_UPDATED', 'BANKING_APPLIED', 'BORROWING_APPLIED', 'POOL_ALLOCATED', 'POOL_DEALLOCATED', 'EUA_FORECAST', 'EUA_HEDGED', 'EUA_SURRENDERED', 'EUA_RECONCILED', 'COMPLIANCE_ALERT', 'USER_ACTION');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imo_company_number" TEXT NOT NULL,
    "registration_country" VARCHAR(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vessel" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "imo_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag_state" VARCHAR(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voyage" (
    "id" TEXT NOT NULL,
    "vessel_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "voyage_type" "VoyageType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voyage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionRecord" (
    "id" TEXT NOT NULL,
    "voyage_id" TEXT NOT NULL,
    "co2_tonnes" DECIMAL(10,3) NOT NULL,
    "n2o_tonnes" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "ch4_tonnes" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "energy_gj" DECIMAL(12,3) NOT NULL,
    "import_source" "ImportSource" NOT NULL,
    "period_year" INTEGER NOT NULL,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmissionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL,
    "emission_record_id" TEXT NOT NULL,
    "verifier_id" TEXT NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL,
    "certificate_number" TEXT,
    "verified_at" TIMESTAMP(3) NOT NULL,
    "findings" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelEUBalance" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "period_year" INTEGER NOT NULL,
    "balance_gco2e" BIGINT NOT NULL,
    "banked_gco2e" BIGINT NOT NULL DEFAULT 0,
    "borrowed_gco2e" BIGINT NOT NULL DEFAULT 0,
    "pool_allocation_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelEUBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolAllocation" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "vessel_id" TEXT NOT NULL,
    "period_year" INTEGER NOT NULL,
    "pool_id" TEXT NOT NULL,
    "allocation_type" "AllocationType" NOT NULL,
    "amount_gco2e" BIGINT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EUAOperation" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "operation_type" "OperationType" NOT NULL,
    "euas_count" INTEGER NOT NULL,
    "price_per_eua" DECIMAL(10,2),
    "executed_at" TIMESTAMP(3) NOT NULL,
    "reference_voyage_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EUAOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "event_type" "EventType" NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_imo_company_number_key" ON "Company"("imo_company_number");

-- CreateIndex
CREATE INDEX "Company_imo_company_number_idx" ON "Company"("imo_company_number");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_imo_number_key" ON "Vessel"("imo_number");

-- CreateIndex
CREATE INDEX "Vessel_company_id_idx" ON "Vessel"("company_id");

-- CreateIndex
CREATE INDEX "Vessel_imo_number_idx" ON "Vessel"("imo_number");

-- CreateIndex
CREATE INDEX "Voyage_vessel_id_idx" ON "Voyage"("vessel_id");

-- CreateIndex
CREATE INDEX "Voyage_start_date_idx" ON "Voyage"("start_date");

-- CreateIndex
CREATE INDEX "EmissionRecord_voyage_id_idx" ON "EmissionRecord"("voyage_id");

-- CreateIndex
CREATE INDEX "EmissionRecord_period_year_idx" ON "EmissionRecord"("period_year");

-- CreateIndex
CREATE INDEX "EmissionRecord_imported_at_idx" ON "EmissionRecord"("imported_at");

-- CreateIndex
CREATE INDEX "VerificationRecord_emission_record_id_idx" ON "VerificationRecord"("emission_record_id");

-- CreateIndex
CREATE INDEX "VerificationRecord_verifier_id_idx" ON "VerificationRecord"("verifier_id");

-- CreateIndex
CREATE INDEX "VerificationRecord_verification_status_idx" ON "VerificationRecord"("verification_status");

-- CreateIndex
CREATE UNIQUE INDEX "FuelEUBalance_company_id_period_year_key" ON "FuelEUBalance"("company_id", "period_year");

-- CreateIndex
CREATE INDEX "FuelEUBalance_company_id_idx" ON "FuelEUBalance"("company_id");

-- CreateIndex
CREATE INDEX "FuelEUBalance_period_year_idx" ON "FuelEUBalance"("period_year");

-- CreateIndex
CREATE UNIQUE INDEX "PoolAllocation_vessel_id_period_year_key" ON "PoolAllocation"("vessel_id", "period_year");

-- CreateIndex
CREATE INDEX "PoolAllocation_company_id_idx" ON "PoolAllocation"("company_id");

-- CreateIndex
CREATE INDEX "PoolAllocation_vessel_id_idx" ON "PoolAllocation"("vessel_id");

-- CreateIndex
CREATE INDEX "PoolAllocation_period_year_idx" ON "PoolAllocation"("period_year");

-- CreateIndex
CREATE INDEX "PoolAllocation_pool_id_idx" ON "PoolAllocation"("pool_id");

-- CreateIndex
CREATE INDEX "EUAOperation_company_id_idx" ON "EUAOperation"("company_id");

-- CreateIndex
CREATE INDEX "EUAOperation_operation_type_idx" ON "EUAOperation"("operation_type");

-- CreateIndex
CREATE INDEX "EUAOperation_executed_at_idx" ON "EUAOperation"("executed_at");

-- CreateIndex
CREATE INDEX "AuditEvent_user_id_idx" ON "AuditEvent"("user_id");

-- CreateIndex
CREATE INDEX "AuditEvent_resource_type_resource_id_idx" ON "AuditEvent"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "AuditEvent_created_at_idx" ON "AuditEvent"("created_at");

-- AddForeignKey
ALTER TABLE "Vessel" ADD CONSTRAINT "Vessel_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voyage" ADD CONSTRAINT "Voyage_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "Vessel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionRecord" ADD CONSTRAINT "EmissionRecord_voyage_id_fkey" FOREIGN KEY ("voyage_id") REFERENCES "Voyage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_emission_record_id_fkey" FOREIGN KEY ("emission_record_id") REFERENCES "EmissionRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelEUBalance" ADD CONSTRAINT "FuelEUBalance_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelEUBalance" ADD CONSTRAINT "FuelEUBalance_pool_allocation_id_fkey" FOREIGN KEY ("pool_allocation_id") REFERENCES "PoolAllocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolAllocation" ADD CONSTRAINT "PoolAllocation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolAllocation" ADD CONSTRAINT "PoolAllocation_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "Vessel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EUAOperation" ADD CONSTRAINT "EUAOperation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

