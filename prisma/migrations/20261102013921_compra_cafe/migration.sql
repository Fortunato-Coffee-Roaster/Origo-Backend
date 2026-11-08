-- CreateTable
CREATE TABLE "CompraCafe" (
    "id_compra" TEXT NOT NULL,
    "id_lote" TEXT NOT NULL,
    "id_almacen" TEXT NOT NULL,
    "id_proveedor" TEXT,
    "cantidad_g" DOUBLE PRECISION NOT NULL,
    "costo_compra_kg" DOUBLE PRECISION NOT NULL,
    "costo_adicional_kg" DOUBLE PRECISION,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT,
    "id_user" TEXT NOT NULL,

    CONSTRAINT "CompraCafe_pkey" PRIMARY KEY ("id_compra")
);

-- CreateIndex
CREATE INDEX "CompraCafe_id_lote_idx" ON "CompraCafe"("id_lote");

-- CreateIndex
CREATE INDEX "CompraCafe_fecha_ingreso_idx" ON "CompraCafe"("fecha_ingreso");

-- AddForeignKey
ALTER TABLE "CompraCafe" ADD CONSTRAINT "CompraCafe_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "Lote"("id_lote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompraCafe" ADD CONSTRAINT "CompraCafe_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "Almacen"("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompraCafe" ADD CONSTRAINT "CompraCafe_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "Proveedor"("id_proveedor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompraCafe" ADD CONSTRAINT "CompraCafe_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Reglas básicas en la base (Prisma no modela CHECK, no genera drift)
ALTER TABLE "CompraCafe" ADD CONSTRAINT "CompraCafe_valores_check" CHECK (
    "cantidad_g" > 0
    AND "costo_compra_kg" >= 0
    AND ("costo_adicional_kg" IS NULL OR "costo_adicional_kg" >= 0)
);

-- Permisos
INSERT INTO "Permiso" ("id_permiso", "codigo", "descripcion", "modulo")
VALUES
  (gen_random_uuid()::text, 'inventario.compras-cafe.create', 'Permite registrar compras de café verde', 'inventario'),
  (gen_random_uuid()::text, 'inventario.compras-cafe.read',   'Permite ver compras de café verde', 'inventario')
ON CONFLICT ("codigo") DO NOTHING;