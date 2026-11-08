import { OrigenRepository } from "../../repository/origen.repository";
import { ProveedorRepository } from "../../repository/proveedor.repository";

interface DatosOrigenProveedor {
    id_origen?: string | null;
    id_proveedor?: string | null;
    // true al asignar a mano (crear/editar). false cuando se hereda de otro
    // registro (ej. lote derivado de un pedido): el proveedor pudo desactivarse
    // después y eso no debe bloquear la operación.
    exigirActivo: boolean;
}

// Regla compartida por Lote y Muestra: el origen debe existir y el proveedor
// debe existir (y estar activo si se asigna a mano). Lanza Error si no cumple.
export const validarOrigenProveedor = async (
    origenRepository: OrigenRepository,
    proveedorRepository: ProveedorRepository,
    { id_origen, id_proveedor, exigirActivo }: DatosOrigenProveedor,
): Promise<void> => {
    if (id_origen) {
        const origen = await origenRepository.getOrigenById(id_origen);
        if (!origen) throw new Error('El origen indicado no existe');
    }

    if (id_proveedor) {
        const proveedor = await proveedorRepository.getProveedorById(id_proveedor);
        if (!proveedor) throw new Error('El proveedor indicado no existe');
        if (exigirActivo && !proveedor.activo) throw new Error(`El proveedor "${proveedor.nombre}" está inactivo`);
    }
};
