import instancia from "../axios";

export const getSubcategorias = async () => {
    return instancia.get('producto/listar_subcategorias');  
}

export const getSubcategoriasActivas = async () => {
    return instancia.get('producto/listar_subcategorias_activas');  
}

export const obtenerSubcategoria = async (id) => {
    return instancia.get(`producto/obtener_subcategoria/${id}/`);  
}

export const crearSubcategoria = async (data) => {
    return instancia.post('producto/crear_subcategoria', data);  
}

export const editarSubcategoria = async (id, data) => {
    return instancia.patch(`producto/editar_subcategoria/${id}`, data);  
}

export const eliminarSubcategoria = async (id) => {
    return instancia.delete(`producto/eliminar_subcategoria/${id}`);  
}

export const activarSubcategoria = async (id) => {
    return instancia.patch(`producto/activar_subcategoria/${id}`);  
}