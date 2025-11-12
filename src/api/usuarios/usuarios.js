import instancia from "../axios";

// Listar todos los usuarios
export const getUsers = async () => {
  return instancia.get('/usuario/users/')
}

// Actualizar perfil del usuario actual
export const updateProfile = async (data) => {
  return instancia.put('/usuario/profile/update/', data)
}

// Eliminar usuario por ID
export const deleteUser = async (id) => {
  return instancia.delete(`/usuario/users/${id}/delete/`)
}

// Actualizar usuario por ID
export const updateUser = async (id, data) => {
  return instancia.put(`/usuario/users/update/${id}`, data)
}