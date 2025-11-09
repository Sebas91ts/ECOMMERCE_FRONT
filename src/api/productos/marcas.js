import instancia from "../axios";

export const getMarcas = async () => {
    return instancia.get('producto/listar_marcas');  
}

export const getMarcasActivas = async () => {
    return instancia.get('producto/listar_marcas_activas');  
}

export const obtenerMarca = async (id) => {
    return instancia.get(`producto/obtener_marca/${id}/`);  
}

export const crearMarca = async (data) => {
    return instancia.post('producto/crear_marca', data);  
}

export const editarMarca = async (id, data) => {
    return instancia.patch(`producto/editar_marca/${id}`, data);  
}

export const eliminarMarca = async (id) => {
    return instancia.delete(`producto/eliminar_marca/${id}`);  
}

export const activarMarca = async (id) => {
    return instancia.patch(`producto/activar_marca/${id}`);  
}