import instancia from "../axios";

export const listarComponentes = () => {
  return instancia.get('usuario/listar_componentes');
}

export const crearComponente = (nombre, descripcion) => {
  return instancia.post('usuario/crear_componente', { nombre, descripcion });
}

export const editarComponente = (componente_id, data) => {
  return instancia.patch(`usuario/editar_componente/${componente_id}`, data);
}

export const eliminarComponente = (componente_id) => {
  return instancia.delete(`usuario/eliminar_componente/${componente_id}`);
}

export const activarComponente = (componente_id) => {
  return instancia.patch(`usuario/activar_componente/${componente_id}`);
}
