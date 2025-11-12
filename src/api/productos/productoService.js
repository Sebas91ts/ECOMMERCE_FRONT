import instancia from "../axios";

export const getCategoriasActivas = async () => {
    return instancia.get('producto/listar_categorias_activas');  
}

export const getMarcasActivas = async () => {
    return instancia.get('producto/listar_marcas_activas');  
}

export const getSubcategoriasActivas = async () => {
    return instancia.get('producto/listar_subcategorias_activas');  
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