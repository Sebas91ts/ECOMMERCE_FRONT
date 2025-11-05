import instancia from "../axios";

export const listarPrivilegios = () => {
  return instancia.get('usuario/listar_privilegios');
}

export const asignarPrivilegio = (grupo_id, componente_id, permisos) => {
  return instancia.post('usuario/asignar_privilegio', {
    grupo_id,
    componente_id,
    ...permisos
  });
}

export const editarPrivilegio = (privilegio_id, permisos) => {
  return instancia.patch(`usuario/editar_privilegio/${privilegio_id}`, permisos);
}

export const eliminarPrivilegio = (privilegio_id) => {
  return instancia.delete(`usuario/eliminar_privilegio/${privilegio_id}`);
}

export const asignarPrivilegiosGrupo = (grupo_id, privilegios) => {
  return instancia.post('usuario/asignar_privilegios_grupo', {
    grupo_id,
    privilegios
  });
}
