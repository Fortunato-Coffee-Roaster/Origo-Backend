-- AnalisisFisico
ALTER TABLE "AnalisisFisico" RENAME COLUMN "peso_defectos" TO "peso_defectos_g";
ALTER TABLE "AnalisisFisico" RENAME COLUMN "peso_muestra" TO "peso_muestra_g";
ALTER TABLE "AnalisisFisico" RENAME COLUMN "peso_muestra_tostada" TO "peso_muestra_tostada_g";
ALTER TABLE "AnalisisFisico" RENAME COLUMN "peso_pergamino" TO "peso_pergamino_g";

-- IngresoCafe
ALTER TABLE "IngresoCafe" RENAME COLUMN "cantidad_kg" TO "cantidad_g";

-- InventarioLote
ALTER TABLE "InventarioLote" RENAME COLUMN "cantidad_kg" TO "cantidad_g";
ALTER TABLE "InventarioLote" RENAME COLUMN "cantidad_tostado_kg" TO "cantidad_tostado_g";

-- InventarioLoteTostado
ALTER TABLE "InventarioLoteTostado" RENAME COLUMN "cantidad_kg" TO "cantidad_g";

-- InventarioMuestra
ALTER TABLE "InventarioMuestra" RENAME COLUMN "peso" TO "peso_g";

-- Lote
ALTER TABLE "Lote" RENAME COLUMN "peso" TO "peso_g";
ALTER TABLE "Lote" RENAME COLUMN "peso_tostado" TO "peso_tostado_g";

-- LoteTostado
ALTER TABLE "LoteTostado" RENAME COLUMN "peso" TO "peso_g";

-- Muestra
ALTER TABLE "Muestra" RENAME COLUMN "peso" TO "peso_g";

-- Pedido
ALTER TABLE "Pedido" RENAME COLUMN "pesos" TO "pesos_g";

-- Tueste
ALTER TABLE "Tueste" RENAME COLUMN "merma" TO "merma_porcentaje";
ALTER TABLE "Tueste" RENAME COLUMN "peso_entrada" TO "peso_entrada_g";
ALTER TABLE "Tueste" RENAME COLUMN "peso_salida" TO "peso_salida_g";

-- MovimientoAlmacen.cantidad: sin cambio de nombre. Para café va en gramos.
COMMENT ON COLUMN "MovimientoAlmacen"."cantidad" IS 'Para LOTE, LOTE_TOSTADO y MUESTRA: gramos. Para el resto: unidades.';