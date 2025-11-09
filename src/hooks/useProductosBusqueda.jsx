import { useState, useEffect } from 'react'
import { buscarProductos } from '../api/productos/busqueda'

export const useProductosBusqueda = (initialFilters = {}) => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState({})

  const buscar = async (newFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const mergedFilters = { ...filters, ...newFilters }
      setFilters(mergedFilters)

      const response = await buscarProductos(mergedFilters)

      if (response.data.status === 1) {
        setProductos(response.data.values.productos)
        setPagination(response.data.values.pagination)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError('Error al buscar productos')
      console.error('Error en búsqueda:', err)
    } finally {
      setLoading(false)
    }
  }

  const cambiarPagina = (page) => {
    buscar({ ...filters, page })
  }

  const limpiarFiltros = () => {
    const nuevosFiltros = { page: 1, page_size: filters.page_size || 20 }
    setFilters(nuevosFiltros)
    buscar(nuevosFiltros)
  }

  useEffect(() => {
    buscar()
  }, [])

  return {
    productos,
    loading,
    error,
    filters,
    pagination,
    buscar,
    cambiarPagina,
    limpiarFiltros,
    setFilters
  }
}
