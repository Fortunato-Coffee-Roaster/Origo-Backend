/*
  Warnings:

  - You are about to drop the column `cant_suscripcion` on the `UserCliente` table. All the data in the column will be lost.
  - You are about to drop the column `suscripcion` on the `UserCliente` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('ACTIVA', 'RENOVADA', 'FINALIZADA', 'CANCELADA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HistorialEntidad" ADD VALUE 'SUSCRIPCION';
ALTER TYPE "HistorialEntidad" ADD VALUE 'TIPO_SUSCRIPCION';

-- AlterTable
ALTER TABLE "UserCliente" DROP COLUMN "cant_suscripcion",
DROP COLUMN "suscripcion";

-- CreateTable
CREATE TABLE "TipoSuscripcion" (
    "id_tipo_suscripcion" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad_meses" INTEGER NOT NULL,
    "peso_bolsa_g" INTEGER NOT NULL,
    "cant_bolsas" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipoSuscripcion_pkey" PRIMARY KEY ("id_tipo_suscripcion")
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id_suscripcion" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_tipo_suscripcion" TEXT NOT NULL,
    "duracion_meses" INTEGER NOT NULL,
    "peso_bolsa_g" INTEGER NOT NULL,
    "cant_bolsas" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoSuscripcion" NOT NULL DEFAULT 'ACTIVA',
    "id_suscripcion_anterior" TEXT,
    "comentario" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id_suscripcion")
);

-- CreateTable
CREATE TABLE "SuscripcionCongelamiento" (
    "id_congelamiento" TEXT NOT NULL,
    "id_suscripcion" TEXT NOT NULL,
    "fecha_congelamiento" TIMESTAMP(3) NOT NULL,
    "fecha_reactivacion" TIMESTAMP(3),
    "dias" INTEGER,
    "comentario" TEXT,
    "congelado_por" TEXT NOT NULL,
    "reactivado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuscripcionCongelamiento_pkey" PRIMARY KEY ("id_congelamiento")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoSuscripcion_nombre_key" ON "TipoSuscripcion"("nombre");

-- CreateIndex
CREATE INDEX "Suscripcion_id_cliente_idx" ON "Suscripcion"("id_cliente");

-- CreateIndex
CREATE INDEX "Suscripcion_estado_fecha_fin_idx" ON "Suscripcion"("estado", "fecha_fin");

-- CreateIndex
CREATE INDEX "SuscripcionCongelamiento_id_suscripcion_idx" ON "SuscripcionCongelamiento"("id_suscripcion");

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "UserCliente"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_id_tipo_suscripcion_fkey" FOREIGN KEY ("id_tipo_suscripcion") REFERENCES "TipoSuscripcion"("id_tipo_suscripcion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_id_suscripcion_anterior_fkey" FOREIGN KEY ("id_suscripcion_anterior") REFERENCES "Suscripcion"("id_suscripcion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuscripcionCongelamiento" ADD CONSTRAINT "SuscripcionCongelamiento_id_suscripcion_fkey" FOREIGN KEY ("id_suscripcion") REFERENCES "Suscripcion"("id_suscripcion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuscripcionCongelamiento" ADD CONSTRAINT "SuscripcionCongelamiento_congelado_por_fkey" FOREIGN KEY ("congelado_por") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuscripcionCongelamiento" ADD CONSTRAINT "SuscripcionCongelamiento_reactivado_por_fkey" FOREIGN KEY ("reactivado_por") REFERENCES "User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
