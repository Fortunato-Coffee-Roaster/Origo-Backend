/*
  P0-4 · PrecioLote (lista de precios del café verde)

  1. Crea PrecioLote (1:1 con Lote).
  2. Pasa los precios que hoy están en Lote:
       precio_1 → precio_escala_1_kg
       escala_2 → precio_escala_2_kg
       escala_3 → precio_escala_3_kg
       precio_sugerido_kg queda en null (no existía).
     Solo lotes de la tienda (owned_by_store) con las 3 escalas completas y
     escala_1 ≥ escala_2 ≥ escala_3 > 0. Los que no cumplen no se migran
     (se cargan de nuevo con PUT /lote/:id/precios).
     Quién cambia cada precio queda en Historial (no en PrecioLote).
  3. Crea los permisos nuevos (convención modulo.recurso.accion).
  4. Borra precio_1, escala_2 y escala_3 de Lote.
  5. Agrega PRECIO_LOTE a HistorialEntidad.
  6. Muestra.id_origen pasa a opcional (igual que Lote): DROP NOT NULL y la
     FK pasa a ON DELETE SET NULL.
*/

-- AlterEnum
ALTER TYPE "HistorialEntidad" ADD VALUE 'PRECIO_LOTE';

-- DropForeignKey
ALTER TABLE "Muestra" DROP CONSTRAINT "Muestra_id_origen_fkey";

-- AlterTable
ALTER TABLE "Muestra" ALTER COLUMN "id_origen" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Muestra" ADD CONSTRAINT "Muestra_id_origen_fkey" FOREIGN KEY ("id_origen") REFERENCES "Origen"("id_origen") ON DELETE SET NULL ON UPDATE CASCADE;

-- ───────────── 1. Tabla ─────────────
-- CreateTable
CREATE TABLE "PrecioLote" (
    "id_lote" TEXT NOT NULL,
    "precio_sugerido_kg" DOUBLE PRECISION,
    "precio_escala_1_kg" DOUBLE PRECISION NOT NULL,
    "precio_escala_2_kg" DOUBLE PRECISION NOT NULL,
    "precio_escala_3_kg" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrecioLote_pkey" PRIMARY KEY ("id_lote")
);

-- Regla de negocio también en la base (Prisma no modela CHECK, no genera drift).
ALTER TABLE "PrecioLote" ADD CONSTRAINT "PrecioLote_escalas_check" CHECK (
    "precio_escala_3_kg" > 0
    AND "precio_escala_2_kg" >= "precio_escala_3_kg"
    AND "precio_escala_1_kg" >= "precio_escala_2_kg"
    AND ("precio_sugerido_kg" IS NULL OR "precio_sugerido_kg" >= "precio_escala_1_kg")
);

-- ───────────── 2. Migrar precios existentes ─────────────
INSERT INTO "PrecioLote" ("id_lote", "precio_sugerido_kg", "precio_escala_1_kg", "precio_escala_2_kg", "precio_escala_3_kg", "updated_at")
SELECT l."id_lote", NULL, l."precio_1", l."escala_2", l."escala_3", CURRENT_TIMESTAMP
FROM "Lote" l
WHERE l."owned_by_store" = true
  AND l."precio_1" IS NOT NULL AND l."escala_2" IS NOT NULL AND l."escala_3" IS NOT NULL
  AND l."escala_3" > 0 AND l."escala_2" >= l."escala_3" AND l."precio_1" >= l."escala_2";

-- ───────────── 3. Permisos ─────────────
INSERT INTO "Permiso" ("id_permiso", "codigo", "descripcion", "modulo")
VALUES
  (gen_random_uuid()::text, 'costeo.lotes-precios.read',   'Permite ver la lista de precios del café verde', 'costeo'),
  (gen_random_uuid()::text, 'costeo.lotes-precios.update', 'Permite editar precios del café verde (solo ADMIN)', 'costeo'),
  (gen_random_uuid()::text, 'costeo.lotes-costo.read',     'Permite ver el costo de los lotes', 'costeo')
ON CONFLICT ("codigo") DO NOTHING;

-- ───────────── 4. Quitar columnas viejas ─────────────
-- AlterTable
ALTER TABLE "Lote" DROP COLUMN "escala_2",
DROP COLUMN "escala_3",
DROP COLUMN "precio_1";

-- AddForeignKey
ALTER TABLE "PrecioLote" ADD CONSTRAINT "PrecioLote_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "Lote"("id_lote") ON DELETE RESTRICT ON UPDATE CASCADE;