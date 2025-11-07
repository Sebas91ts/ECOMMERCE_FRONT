import instancia from "../axios";

export const listarGrupos = () => {
  return instancia.get('usuario/listar_grupos');
}

export const crearGrupo = (nombre, descripcion = "") => {
  return instancia.post('usuario/crear_grupo', { nombre, descripcion });
}

export const editarGrupo = (grupo_id, data) => {
  return instancia.patch(`usuario/editar_grupo/${grupo_id}`, data);
}

export const eliminarGrupo = (grupo_id) => {
  return instancia.delete(`usuario/eliminar_grupo/${grupo_id}`);
}

export const activarGrupo = (grupo_id) => {
  return instancia.patch(`usuario/activar_grupo/${grupo_id}`);
}
