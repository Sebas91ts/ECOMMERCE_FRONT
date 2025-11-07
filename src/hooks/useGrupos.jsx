import { useState, useEffect } from 'react'
import { listarGrupos, crearGrupo, editarGrupo, eliminarGrupo, activarGrupo } from '../api/permisos/grupos'

export const useGrupos = () => {
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGrupos = async () => {
    try {
      setLoading(true)
      const { data } = await listarGrupos()
      setGrupos(Array.isArray(data.values?.grupos) ? data.values.grupos : [])
    } catch (err) {
      setError(err)
      setGrupos([])
    } finally {
      setLoading(false)
    }
  }

  const crear = async (nombre, descripcion) => {
    await crearGrupo(nombre, descripcion)
    await fetchGrupos()
  }

  const editar = async (id, data) => {
    await editarGrupo(id, data)
    await fetchGrupos()
  }

  const eliminar = async (id) => {
    await eliminarGrupo(id)
    await fetchGrupos()
  }

  const activar = async (id) => {
    await activarGrupo(id)
    await fetchGrupos()
  }

  useEffect(() => {
    fetchGrupos()
  }, [])

  return { grupos, loading, error, crear, editar, eliminar, activar, fetchGrupos }
}
