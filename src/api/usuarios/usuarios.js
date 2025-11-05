import instancia from "../axios";

export const getUsuarios = async () => {
    return instancia.get('usuario/mostrarUsuarios/');  
}

export const postCopropietario = async (data) => {
    return instancia.post('usuario/registrarCopropietario/', data);  
}

export const postPersonal = async (data) => {
    return instancia.post('usuario/registrarPersonal/', data);  
}

export const getPersonal = async () => {
    return instancia.get('usuario/personal/');  
}

export const updatePersonal = async (id, data) => {
    return instancia.put(`usuario/personal/${id}/`, data);
}

export const updateUsuario = async (id, data) => {
    return instancia.put(`usuario/usuarios/users/${id}/`, data);
}

export const getBitacora = async () => {
    return instancia.get('usuario/bitacora/');  
}

export const getResidentes = async () => {
    return instancia.get('usuario/residentes/');  
}

export const updateResidente = async (id, data) => {
    return instancia.put(`usuario/residentes/${id}/`, data);
}

export const registrarBitacora = async (data) => {
    return instancia.post('usuario/bitacora/registrar/', data);  
}