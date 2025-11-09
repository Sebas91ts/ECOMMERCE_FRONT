import instancia from "../axios";

export const getProductos = async () => {
    return instancia.get('producto/listar_productos');  
}

export const getProductosActivos = async () => {
    return instancia.get('producto/listar_productos_activos');  
}

export const obtenerProducto = async (id) => {
    return instancia.get(`producto/obtener_producto/${id}/`);  
}

export const crearProducto = async (data) => {
    console.log("datos a enviar:",data)
    return instancia.post('producto/crear_producto', data);  
}

export const editarProducto = async (id, data) => {
    console.log("datos a enviar:",data)
    return instancia.patch(`producto/editar_producto/${id}`, data);  
}

export const eliminarProducto = async (id) => {
    return instancia.delete(`producto/eliminar_producto/${id}`);  
}

export const activarProducto = async (id) => {
    return instancia.patch(`producto/activar_producto/${id}`);  
}


export const buscarProductos = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Agregar solo los filtros que tengan valor
  Object.keys(filters).forEach(key => {
    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
      params.append(key, filters[key]);
    }
  });
  
  return instancia.get(`producto/buscar_productos?${params.toString()}`);
}