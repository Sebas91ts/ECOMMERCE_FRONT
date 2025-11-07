import { useState, useEffect } from 'react'
import {
  listarComponentes,
  crearComponente,
  editarComponente,
  eliminarComponente,
  activarComponente
} from '../api/permisos/componentes'

export const useComponentes = () => {
  const [componentes, setComponentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [operationLoading, setOperationLoading] = useState(false)

  const fetchComponentes = async () => {
    try {
      setLoading(true)
      const { data } = await listarComponentes()
      setComponentes(data.values || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const executeOperation = async (operation) => {
    try {
      setOperationLoading(true)
      await operation()
      await fetchComponentes() // Refrescar la lista después de cualquier operación
    } catch (err) {
      setError(err.message)
      throw err // Re-lanzar el error para que el componente lo maneje
    } finally {
      setOperationLoading(false)
    }
  }

  const crear = (nombre, descripcion) =>
    executeOperation(() => crearComponente(nombre, descripcion))

  const editar = (id, data) =>
    executeOperation(() => editarComponente(id, data))

  const eliminar = (id) => executeOperation(() => eliminarComponente(id))

  const activar = (id) => executeOperation(() => activarComponente(id))

  useEffect(() => {
    fetchComponentes()
  }, [])

  return {
    componentes,
    loading,
    error,
    operationLoading,
    crear,
    editar,
    eliminar,
    activar,
    fetchComponentes
  }
}
