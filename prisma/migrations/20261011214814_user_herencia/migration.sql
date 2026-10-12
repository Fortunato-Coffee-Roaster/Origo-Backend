/*
  Herencia de User: User (base) + UserCliente / UserStaff / UserAdmin.

  Es el mismo SQL que generó Prisma, reordenado para no perder datos:
    0. corrige los registros que no tienen un cliente como dueño
    1. valida que la base esté lista (si algo no cuadra, aborta sin cambiar nada)
    2. crea el enum, la columna `tipo` y las tablas nuevas
    3. clasifica a cada usuario y copia sus datos a su tabla
    4. verifica la copia
    5. recién entonces borra las columnas viejas y mueve las claves foráneas

  Paquete gana `owned_by_store` y su cliente pasa a ser opcional, igual que
  en Lote, Pedido y el resto: un paquete es de un cliente o de la tienda.

  Regla de clasificación:
    - rol = 'cliente'                      -> CLIENTE
    - id_rol = el rol de super admin       -> ADMIN
    - cualquier otro usuario interno       -> STAFF
*/

-- Rol de super admin (SUPER_ADMIN_ROL_ID del .env): quienes lo tienen pasan a ADMIN.
-- ⚠️ Es un dato de esta base: si producción usa otro id, cámbialo antes de desplegar.
CREATE TEMP TABLE "_herencia_config" ON COMMIT DROP AS
SELECT 'a3f8e2d0-1b4c-4e9a-9f6d-7c2b5a8e3d10'::text AS super_admin_rol_id;

-- ───────────── 0. Corrección de datos ─────────────
-- Paquete: el cliente pasa a ser opcional y se agrega owned_by_store.
ALTER TABLE "Paquete" ADD COLUMN "owned_by_store" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id_cliente" DROP NOT NULL;

-- Los 57 paquetes PAQ-LEGACY a nombre de Renato Martinetti (super_admin)
-- son de la tienda: quedan sin cliente y con owned_by_store.
-- En una base donde no exista este usuario, no hace nada.
UPDATE "Paquete"
SET "owned_by_store" = true, "id_cliente" = NULL
WHERE "id_cliente" = '25eba595-1556-4a90-a3c7-27edc759a127';

-- Pedido de Maquila ELIMINADO (07/12/2025) que estaba a nombre de un usuario
-- interno. Un pedido solo puede ser de un cliente o de la tienda: se deja sin
-- cliente y marcado como de tienda. En una base donde no exista, no hace nada.
UPDATE "Pedido"
SET "id_user" = NULL, "owned_by_store" = true
WHERE "id_pedido" = 'e6ced865-d578-4e63-86dd-884c9222702c'
  AND "eliminado" = true;

-- ───────────── 1. Validaciones previas ─────────────
DO $$
DECLARE
    v_super text;
    v_detalle text;
BEGIN
    -- En una base sin usuarios (base nueva o la base sombra de Prisma) no hay
    -- nada que validar ni que copiar.
    IF NOT EXISTS (SELECT 1 FROM "User") THEN
        RETURN;
    END IF;

    SELECT super_admin_rol_id INTO v_super FROM "_herencia_config";

    IF NOT EXISTS (SELECT 1 FROM "Rol" WHERE "id_rol" = v_super) THEN
        RAISE EXCEPTION 'El rol de super admin "%" no existe en la tabla Rol. Reemplaza el valor al inicio de la migración por el SUPER_ADMIN_ROL_ID de tu .env.', v_super;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "User" WHERE "id_rol" = v_super) THEN
        RAISE EXCEPTION 'Ningún usuario tiene el rol de super admin "%": no quedaría ningún ADMIN. Revisa el valor.', v_super;
    END IF;

    -- Lotes, pedidos, paquetes, etc. solo pueden pertenecer a un cliente.
    SELECT string_agg(tabla || ': ' || total, ', ') INTO v_detalle
    FROM (
        SELECT 'Lote' AS tabla, COUNT(*) AS total FROM "Lote" t JOIN "User" u ON u."id_user" = t."id_user" WHERE lower(trim(u."rol")) <> 'cliente'
        UNION ALL SELECT 'LoteTostado', COUNT(*) FROM "LoteTostado" t JOIN "User" u ON u."id_user" = t."id_user" WHERE lower(trim(u."rol")) <> 'cliente'
        UNION ALL SELECT 'Muestra', COUNT(*) FROM "Muestra" t JOIN "User" u ON u."id_user" = t."id_user" WHERE lower(trim(u."rol")) <> 'cliente'
        UNION ALL SELECT 'Bolsa', COUNT(*) FROM "Bolsa" t JOIN "User" u ON u."id_user" = t."id_user" WHERE lower(trim(u."rol")) <> 'cliente'
        UNION ALL SELECT 'Pedido', COUNT(*) FROM "Pedido" t JOIN "User" u ON u."id_user" = t."id_user" WHERE lower(trim(u."rol")) <> 'cliente'
        UNION ALL SELECT 'Paquete', COUNT(*) FROM "Paquete" t JOIN "User" u ON u."id_user" = t."id_cliente" WHERE lower(trim(u."rol")) <> 'cliente'
        UNION ALL SELECT 'BoxRespuesta', COUNT(*) FROM "BoxRespuesta" t JOIN "User" u ON u."id_user" = t."id_user" WHERE lower(trim(u."rol")) <> 'cliente'
    ) x
    WHERE total > 0;

    IF v_detalle IS NOT NULL THEN
        RAISE EXCEPTION 'Hay registros cuyo dueño no es un cliente (%). Hay que resolverlos antes de migrar.', v_detalle;
    END IF;
END $$;

-- ───────────── 2. Estructura nueva ─────────────
-- CreateEnum
CREATE TYPE "TipoUser" AS ENUM ('CLIENTE', 'STAFF', 'ADMIN');

-- `tipo` entra opcional para poder llenarlo; se vuelve obligatorio en el paso 4.
ALTER TABLE "User" ADD COLUMN "tipo" "TipoUser";

-- CreateTable
CREATE TABLE "UserCliente" (
    "id_user" TEXT NOT NULL,
    "nombre_comercial" TEXT,
    "departamento" TEXT,
    "direccion" TEXT,
    "tuestes" INTEGER DEFAULT 0,
    "fecha_primera_compra" TIMESTAMP(3),
    "suscripcion" BOOLEAN NOT NULL DEFAULT false,
    "cant_suscripcion" INTEGER DEFAULT 0,

    CONSTRAINT "UserCliente_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "UserStaff" (
    "id_user" TEXT NOT NULL,
    "cargo" TEXT,
    "id_rol" TEXT,

    CONSTRAINT "UserStaff_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "UserAdmin" (
    "id_user" TEXT NOT NULL,

    CONSTRAINT "UserAdmin_pkey" PRIMARY KEY ("id_user")
);

-- ───────────── 3. Clasificar y copiar ─────────────
UPDATE "User" SET "tipo" = CASE
    WHEN lower(trim("rol")) = 'cliente' THEN 'CLIENTE'::"TipoUser"
    WHEN "id_rol" = (SELECT super_admin_rol_id FROM "_herencia_config") THEN 'ADMIN'::"TipoUser"
    ELSE 'STAFF'::"TipoUser"
END;

INSERT INTO "UserCliente" ("id_user", "nombre_comercial", "departamento", "direccion", "tuestes", "fecha_primera_compra", "suscripcion", "cant_suscripcion")
SELECT "id_user", "nombre_comercial", "departamento", "direccion", "tuestes", "fecha_primera_compra", "suscripcion", "cant_suscripcion"
FROM "User"
WHERE "tipo" = 'CLIENTE';

-- El staff conserva su rol de permisos. `cargo` queda vacío: es un campo nuevo.
INSERT INTO "UserStaff" ("id_user", "id_rol")
SELECT "id_user", "id_rol"
FROM "User"
WHERE "tipo" = 'STAFF';

-- El admin no lleva rol: tiene acceso total.
INSERT INTO "UserAdmin" ("id_user")
SELECT "id_user"
FROM "User"
WHERE "tipo" = 'ADMIN';

-- ───────────── 4. Verificar la copia ─────────────
DO $$
DECLARE
    v_total integer;
    v_hijas integer;
BEGIN
    IF EXISTS (SELECT 1 FROM "User" WHERE "tipo" IS NULL) THEN
        RAISE EXCEPTION 'Quedaron usuarios sin tipo.';
    END IF;

    SELECT COUNT(*) INTO v_total FROM "User";
    SELECT (SELECT COUNT(*) FROM "UserCliente") + (SELECT COUNT(*) FROM "UserStaff") + (SELECT COUNT(*) FROM "UserAdmin") INTO v_hijas;

    IF v_total <> v_hijas THEN
        RAISE EXCEPTION 'La copia no cuadra: % usuarios en User y % en las tablas hijas.', v_total, v_hijas;
    END IF;
END $$;

ALTER TABLE "User" ALTER COLUMN "tipo" SET NOT NULL;

-- ───────────── 5. Quitar lo viejo y mover las claves foráneas ─────────────
-- DropForeignKey
ALTER TABLE "Bolsa" DROP CONSTRAINT "Bolsa_id_user_fkey";

-- DropForeignKey
ALTER TABLE "BoxRespuesta" DROP CONSTRAINT "BoxRespuesta_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Lote" DROP CONSTRAINT "Lote_id_user_fkey";

-- DropForeignKey
ALTER TABLE "LoteTostado" DROP CONSTRAINT "LoteTostado_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Muestra" DROP CONSTRAINT "Muestra_id_user_fkey";

-- DropForeignKey
ALTER TABLE "Paquete" DROP CONSTRAINT "Paquete_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_id_user_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_id_rol_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cant_suscripcion",
DROP COLUMN "departamento",
DROP COLUMN "direccion",
DROP COLUMN "fecha_primera_compra",
DROP COLUMN "id_rol",
DROP COLUMN "nombre_comercial",
DROP COLUMN "rol",
DROP COLUMN "suscripcion",
DROP COLUMN "tuestes";

-- AddForeignKey
ALTER TABLE "UserCliente" ADD CONSTRAINT "UserCliente_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStaff" ADD CONSTRAINT "UserStaff_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStaff" ADD CONSTRAINT "UserStaff_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Rol"("id_rol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdmin" ADD CONSTRAINT "UserAdmin_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Muestra" ADD CONSTRAINT "Muestra_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "UserCliente"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "UserCliente"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteTostado" ADD CONSTRAINT "LoteTostado_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "UserCliente"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bolsa" ADD CONSTRAINT "Bolsa_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "UserCliente"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxRespuesta" ADD CONSTRAINT "BoxRespuesta_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "UserCliente"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "UserCliente"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paquete" ADD CONSTRAINT "Paquete_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "UserCliente"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;