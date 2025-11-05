import instancia from "../axios";

export const login = async (username, password) => {
    return instancia.post('usuario/login/', { username, password });  
}

export const logout = async () => {
    return instancia.post('usuario/logout/');  
}

export const register = async (userData) => {
    return instancia.post('usuario/register/', userData);  
}

export const refresh = async () => {
    return instancia.post('usuario/refresh/');  
}