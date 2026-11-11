-- Permisos que usa el código (checkPermission) y que no estaban en ninguna migración.
-- Sin ellos checkPermission responde 500 ("Permiso no existe en la base de datos").
-- ON CONFLICT: si alguno ya se creó a mano, no se duplica.
-- La asignación a roles (RolPermiso) se hace aparte.

INSERT INTO "Permiso" ("id_permiso", "codigo", "descripcion", "modulo")
VALUES
  (gen_random_uuid()::text, 'inventario.proveedores.read',   'Permite ver el catálogo de proveedores', 'inventario'),
  (gen_random_uuid()::text, 'inventario.proveedores.update', 'Permite crear y editar proveedores', 'inventario'),
  (gen_random_uuid()::text, 'inventario.origenes.read',      'Permite ver el catálogo de orígenes', 'inventario'),
  (gen_random_uuid()::text, 'suscripcion.read',              'Permite ver tipos de suscripción y suscripciones', 'suscripcion'),
  (gen_random_uuid()::text, 'suscripcion.update',            'Permite gestionar tipos de suscripción y suscripciones', 'suscripcion')
ON CONFLICT ("codigo") DO NOTHING;
