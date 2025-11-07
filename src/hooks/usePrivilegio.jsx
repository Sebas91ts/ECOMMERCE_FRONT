import { useState, useEffect } from 'react'
import {
  listarPrivilegios,
  asignarPrivilegio,
  editarPrivilegio,
  eliminarPrivilegio,
  asignarPrivilegiosGrupo
} from '../api/permisos/privilegios'

export const usePrivilegios = () => {
  const [privilegios, setPrivilegios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

const fetchPrivilegios = async () => {
  try {
    setLoading(true)
    const { data } = await listarPrivilegios()
    setPrivilegios(data.values?.privilegios || [])
  } catch (err) {
    setError(err)
    setPrivilegios([])
  } finally {
    setLoading(false)
  }
}


  const asignar = async (grupo_id, componente_id, permisos) => {
    await asignarPrivilegio(grupo_id, componente_id, permisos)
    await fetchPrivilegios()
  }

  const editar = async (id, permisos) => {
    await editarPrivilegio(id, permisos)
    await fetchPrivilegios()
  }

  const eliminar = async (id) => {
    await eliminarPrivilegio(id)
    await fetchPrivilegios()
  }

  const asignarGrupo = async (grupo_id, privilegios) => {
    await asignarPrivilegiosGrupo(grupo_id, privilegios)
    await fetchPrivilegios()
  }

  useEffect(() => {
    fetchPrivilegios()
  }, [])

  return { privilegios, loading, error, asignar, editar, eliminar, asignarGrupo, fetchPrivilegios }
}
