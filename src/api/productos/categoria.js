import instancia from "../axios";

export const getCategorias = async () => {
    return instancia.get('producto/listar_categorias');  
}
export const getCategoriasActivas = async () => {
    return instancia.get('producto/listar_categorias_activas');  
}
export const obtenerCategoria = async (id) => {
    return instancia.get(`producto/obtener_categoria/${id}`);  
}
export const crearCategoria = async (data) => {
    return instancia.post('producto/crear_categoria', data);  
}
export const editarCategoria = async (id, data) => {
    return instancia.patch(`producto/editar_categoria/${id}`, data);  
}
export const eliminarCategoria = async (id) => {
    return instancia.delete(`producto/eliminar_categoria/${id}`);  
}
export const activarCategoria = async (id) => {
    return instancia.patch(`producto/activar_categoria/${id}`);  
}