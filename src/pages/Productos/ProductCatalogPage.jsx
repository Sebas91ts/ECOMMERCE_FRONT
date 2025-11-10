import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react'
import {
  FiInfo,
  FiPackage,
  FiShoppingCart,
  FiTag,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  getCategoriasActivas,
  getMarcasActivas,
  getSubcategoriasActivas
} from '../../api/productos/productoService'
import { useApi } from '../../hooks/useApi'
import { useProductosBusqueda } from '../../hooks/useProductosBusqueda'

const ProductCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    search: '',
    categoria: '',
    subcategoria: '',
    marca: '',
    min_precio: '',
    max_precio: '',
    en_stock: ''
  })

  // Obtener filtros de la URL
  const getFiltersFromURL = () => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      categoria: searchParams.get('categoria') || '',
      subcategoria: searchParams.get('subcategoria') || '',
      marca: searchParams.get('marca') || '',
      min_precio: searchParams.get('min_precio') || '',
      max_precio: searchParams.get('max_precio') || '',
      en_stock: searchParams.get('en_stock') || '',
      page: parseInt(searchParams.get('page')) || 1,
      page_size: parseInt(searchParams.get('page_size')) || 12
    }
    console.log('📋 Filtros de URL:', urlFilters)
    return urlFilters
  }

  // Usar el hook de búsqueda con filtros de URL
  const filtersFromURL = getFiltersFromURL()
  const {
    productos,
    loading,
    error,
    filters,
    pagination,
    buscar,
    cambiarPagina,
    limpiarFiltros
  } = useProductosBusqueda(filtersFromURL)

  // Hooks para datos estáticos
  const { execute: fetchCategorias } = useApi(getCategoriasActivas)
  const { execute: fetchMarcas } = useApi(getMarcasActivas)
  const { execute: fetchSubcategorias } = useApi(getSubcategoriasActivas)

  // Cargar datos iniciales
  useEffect(() => {
    loadCatalogData()
  }, [])

  // Sincronizar localFilters cuando cambien los filtros de URL
  useEffect(() => {
    console.log('🔄 Sincronizando localFilters con filters:', filters)
    setLocalFilters({
      search: filters.search || '',
      categoria: filters.categoria || '',
      subcategoria: filters.subcategoria || '',
      marca: filters.marca || '',
      min_precio: filters.min_precio || '',
      max_precio: filters.max_precio || '',
      en_stock: filters.en_stock || ''
    })
  }, [filters])

  // Función para actualizar URL con filtros
  const updateURLWithFilters = (newFilters) => {
    const params = new URLSearchParams()

    // Agregar solo filtros con valor (excluyendo page_size)
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value != null && key !== 'page_size') {
        params.set(key, value.toString())
      }
    })

    // Siempre incluir page_size
    params.set('page_size', (newFilters.page_size || 12).toString())

    // Incluir página si existe
    if (newFilters.page) {
      params.set('page', newFilters.page.toString())
    }

    const newUrl = `?${params.toString()}`
    console.log('🔗 Actualizando URL a:', newUrl)

    navigate(newUrl, { replace: true })
  }

  // Función para aplicar filtros
  const handleApplyFilters = async () => {
    console.log('🎯 Aplicando filtros desde localFilters:', localFilters)

    // Limpiar filtros vacíos
    const cleanedFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, value]) => value !== '')
    )

    // Agregar paginación
    const filtersToApply = {
      ...cleanedFilters,
      page: 1, // Siempre volver a página 1 al buscar
      page_size: pagination.page_size || 12
    }

    console.log('🚀 Filtros a aplicar:', filtersToApply)

    // Actualizar URL PRIMERO
    updateURLWithFilters(filtersToApply)

    // Luego aplicar búsqueda
    await buscar(filtersToApply)
  }

  const loadCatalogData = async () => {
    try {
      const [categoriasRes, marcasRes, subcategoriasRes] = await Promise.all([
        fetchCategorias(),
        fetchMarcas(),
        fetchSubcategorias()
      ])

      if (categoriasRes?.data?.values?.categorias) {
        setCategorias(categoriasRes.data.values.categorias)
      }
      if (marcasRes?.data?.values?.marcas) {
        setMarcas(marcasRes.data.values.marcas)
      }
      if (subcategoriasRes?.data?.values?.subcategorias) {
        setSubcategorias(subcategoriasRes.data.values.subcategorias)
      }
    } catch (error) {
      console.error('Error cargando datos del catálogo:', error)
    }
  }

  // Función para cambios automáticos (ya no se usa pero la dejo por si acaso)
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1 // Resetear a página 1 cuando cambian filtros
    }

    // Si el valor está vacío, eliminar el filtro
    if (value === '' || value == null) {
      delete newFilters[key]
    }

    buscar(newFilters)
  }

  // Función para búsqueda automática (ya no se usa)
  const handleSearchChange = (value) => {
    // Debounce para búsqueda
    clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(() => {
      handleFilterChange('search', value)
    }, 500)
  }

  const clearAllFilters = () => {
    console.log('🧹 Limpiando todos los filtros')

    const defaultFilters = {
      page: 1,
      page_size: 12,
      search: '',
      categoria: '',
      subcategoria: '',
      marca: '',
      min_precio: '',
      max_precio: '',
      en_stock: ''
    }

    // Actualizar local filters
    setLocalFilters(defaultFilters)

    // Actualizar URL
    updateURLWithFilters(defaultFilters)

    // Ejecutar búsqueda
    buscar(defaultFilters)
  }

  const handlePageChange = (newPage) => {
    console.log('📄 Cambiando a página:', newPage)

    // Actualizar URL con nueva página
    const filtersWithNewPage = {
      ...filters,
      page: newPage,
      page_size: pagination.page_size || 12
    }

    updateURLWithFilters(filtersWithNewPage)
    cambiarPagina(newPage)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price)
  }

  const getSubcategoriasFiltradas = () => {
    if (!localFilters.categoria) return subcategorias
    return subcategorias.filter(
      (sub) => sub.categoria == localFilters.categoria
    )
  }

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      key !== 'page' &&
      key !== 'page_size' &&
      filters[key] !== '' &&
      filters[key] != null
  )

  // Debug useEffect
  useEffect(() => {
    console.log('🔍 searchParams actuales:', Object.fromEntries(searchParams))
  }, [searchParams])

  useEffect(() => {
    console.log('🎯 filters activos:', filters)
  }, [filters])

  useEffect(() => {
    console.log('💾 localFilters:', localFilters)
  }, [localFilters])

  // Componente de Producto
  const ProductoCard = ({ producto, onAddToCart, onClickDetail }) => (
    <div
      className='
            relative bg-white/80 backdrop-blur-sm text-gray-800 rounded-lg 
            shadow-xl shadow-gray-200 border border-gray-100 
            hover:shadow-blue-100 hover:border-blue-200 transition-all duration-300 
            flex flex-col h-full overflow-hidden
        '
    >
      {/* Imagen */}
      <div
        className='h-40 sm:h-48 bg-gray-50 rounded-t-lg flex items-center justify-center overflow-hidden cursor-pointer'
        onClick={() => onClickDetail(producto.id)}
      >
        {producto.imagenes?.[0] ? (
          <img
            src={producto.imagenes[0].url_imagen}
            alt={producto.nombre}
            className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
          />
        ) : (
          <div className='text-gray-400 text-center p-4'>
            <FiTag className='w-6 h-6 mx-auto mb-1 text-gray-300' />
            <p className='text-xs'>Sin imagen</p>
          </div>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className='p-3 flex flex-col flex-grow text-sm'>
        <h3
          className='font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors'
          onClick={() => onClickDetail(producto.id)}
        >
          {producto.nombre}
        </h3>
        <p className='text-gray-500 mb-2 line-clamp-2 flex-grow'>
          {producto.descripcion}
        </p>

        {/* Precios y Stock */}
        <div className='flex items-end justify-between mt-auto pt-2 border-t border-gray-100'>
          <div>
            <span className='text-xl font-bold text-blue-600'>
              {formatPrice(producto.precio_contado)}
            </span>
            {producto.precio_cuota && (
              <p className='text-xs text-gray-400 mt-0.5'>
                12x{' '}
                <span className='font-medium'>
                  {formatPrice(producto.precio_cuota)}
                </span>
              </p>
            )}
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              producto.stock > 0
                ? 'bg-green-50 text-green-700 font-medium'
                : 'bg-red-50 text-red-700 font-medium'
            }`}
          >
            {producto.stock > 0 ? 'En Stock' : 'Agotado'}
          </span>
        </div>
      </div>

      {/* Botones de Acción (Añadir al Carrito y Ver Detalle) */}
      <div className='flex border-t border-gray-100'>
        <button
          className='flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors'
          onClick={() => onAddToCart(producto.id)} // Asume que tienes una función para añadir al carrito
          disabled={producto.stock === 0}
        >
          <FiShoppingCart className='w-4 h-4' />
          <span>Añadir</span>
        </button>
        <button
          className='flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-100'
          onClick={() => onClickDetail(producto.id)}
        >
          <FiInfo className='w-4 h-4' />
          <span>Detalle</span>
        </button>
      </div>
    </div>
  )

  // Componente de Producto en Lista
  const ProductoListItem = ({ producto, onAddToCart, onClickDetail }) => (
    <div
      className='
            bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg 
            shadow-md shadow-gray-100 border border-gray-100 
            hover:shadow-lg hover:border-blue-100 transition-all duration-300 
            p-4 mb-3 cursor-pointer
        '
      onClick={() => onClickDetail(producto.id)}
    >
      <div className='flex items-center gap-4 sm:gap-6'>
        {/* 1. Imagen (Pequeña y Contenida) */}
        <div className='w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0'>
          {producto.imagenes?.[0] ? (
            <img
              src={producto.imagenes[0].url_imagen}
              alt={producto.nombre}
              className='h-full w-full object-contain p-1' // p-1 para mejor look clean
            />
          ) : (
            <div className='text-gray-400 text-center p-2'>
              <FiTag className='w-4 h-4 mx-auto text-gray-300' />
            </div>
          )}
        </div>

        {/* 2. Información Principal (Título y Descripción) */}
        <div className='flex-1 min-w-0'>
          <h3 className='text-base font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors'>
            {producto.nombre}
          </h3>
          <p className='text-xs text-gray-500 line-clamp-2'>
            {producto.descripcion}
          </p>

          {/* Metadatos (Modelo / Garantía) - Visible solo en pantallas grandes */}
          <div className='hidden lg:grid grid-cols-2 gap-4 text-xs pt-2 mt-2 border-t border-gray-100'>
            <div>
              <span className='text-gray-400 flex items-center'>
                <FiTag className='mr-1 w-3 h-3' /> Modelo:
              </span>
              <p className='font-medium text-gray-600'>
                {producto.modelo || 'N/A'}
              </p>
            </div>
            <div>
              <span className='text-gray-400 flex items-center'>
                <FiClock className='mr-1 w-3 h-3' /> Garantía:
              </span>
              <p className='font-medium text-gray-600'>
                {producto.garantia_meses
                  ? `${producto.garantia_meses} meses`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Precios y Stock (Columna de Datos Central) */}
        <div className='flex flex-col items-end flex-shrink-0 w-28 text-right'>
          {/* Precio */}
          <span className='text-lg font-bold text-blue-600'>
            {formatPrice(producto.precio_contado)}
          </span>
          {producto.precio_cuota && (
            <p className='text-xs text-gray-400 mt-0.5'>
              12x {formatPrice(producto.precio_cuota)}
            </p>
          )}
          {/* Stock Badge */}
          <span
            className={`text-xs mt-2 px-2 py-0.5 rounded-full flex items-center ${
              producto.stock > 0
                ? 'bg-green-50 text-green-700 font-medium'
                : 'bg-red-50 text-red-700 font-medium'
            }`}
          >
            {producto.stock > 0 ? (
              <FiCheckCircle className='w-3 h-3 mr-1' />
            ) : (
              <FiXCircle className='w-3 h-3 mr-1' />
            )}
            {producto.stock > 0 ? 'En Stock' : 'Agotado'}
          </span>
        </div>

        {/* 4. Acciones (Botones) */}
        <div className='flex flex-col gap-2 flex-shrink-0'>
          <button
            className='flex items-center justify-center p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400'
            onClick={(e) => {
              e.stopPropagation() // Evita que se active el onClick del div principal
              onAddToCart(producto.id)
            }}
            title='Añadir al carrito'
            disabled={producto.stock === 0}
          >
            <FiShoppingCart className='w-4 h-4' />
          </button>
          <button
            className='flex items-center justify-center p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors'
            onClick={(e) => {
              e.stopPropagation()
              onClickDetail(producto.id)
            }}
            title='Ver detalles'
          >
            <FiInfo className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Catálogo de Productos
          </h1>
          <p className='text-gray-600'>
            {pagination.count
              ? `${pagination.count} productos encontrados`
              : 'Buscando productos...'}
          </p>

          {/* Filtros activos */}
          {hasActiveFilters && (
            <div className='flex flex-wrap gap-2 mt-4'>
              {filters.search && (
                <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
                  Busqueda: "{filters.search}"
                </span>
              )}
              {filters.categoria && (
                <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>
                  Categoría:{' '}
                  {categorias.find((c) => c.id == filters.categoria)?.nombre}
                </span>
              )}
              {filters.marca && (
                <span className='bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm'>
                  Marca: {marcas.find((m) => m.id == filters.marca)?.nombre}
                </span>
              )}
              {filters.min_precio && (
                <span className='bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm'>
                  Precio min: Bs {filters.min_precio}
                </span>
              )}
              {filters.max_precio && (
                <span className='bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm'>
                  Precio max: Bs {filters.max_precio}
                </span>
              )}
            </div>
          )}
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar de Filtros - Desktop - MEJORADO */}
          <div className='hidden lg:block w-80 flex-shrink-0'>
            <div className='bg-white rounded-lg shadow-sm p-6 sticky top-4 max-h-[85vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b'>
                <h2 className='text-lg font-semibold text-gray-900'>Filtros</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              <div className='space-y-6'>
                {/* Búsqueda - MEJORADO CON BOTÓN */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Buscar
                  </label>
                  <div className='flex gap-2'>
                    <div className='relative flex-1'>
                      <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <input
                        type='text'
                        value={localFilters.search || ''}
                        onChange={(e) =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            search: e.target.value
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleApplyFilters()
                          }
                        }}
                        placeholder='Producto, modelo...'
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                      />
                    </div>
                    <button
                      onClick={handleApplyFilters}
                      disabled={loading}
                      className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center text-sm'
                    >
                      <Search className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                {/* Categoría y Subcategoría en ACORDEÓN */}
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Categoría
                    </label>
                    <select
                      value={localFilters.categoria || ''}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          categoria: e.target.value
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                    >
                      <option value=''>Todas las categorías</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {localFilters.categoria && (
                    <div className='animate-fade-in'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Subcategoría
                      </label>
                      <select
                        value={localFilters.subcategoria || ''}
                        onChange={(e) =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            subcategoria: e.target.value
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                      >
                        <option value=''>Todas las subcategorías</option>
                        {getSubcategoriasFiltradas().map((subcategoria) => (
                          <option key={subcategoria.id} value={subcategoria.id}>
                            {subcategoria.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Marca */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Marca
                  </label>
                  <select
                    value={localFilters.marca || ''}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        marca: e.target.value
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                  >
                    <option value=''>Todas las marcas</option>
                    {marcas.map((marca) => (
                      <option key={marca.id} value={marca.id}>
                        {marca.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rango de Precios - MEJORADO */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-3'>
                    Rango de Precio
                  </label>
                  <div className='space-y-3'>
                    {/* Precio Mínimo */}
                    <div>
                      <label className='block text-xs text-gray-500 mb-1'>
                        Precio Mínimo
                      </label>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm'>
                          Bs
                        </span>
                        <input
                          type='number'
                          min='0'
                          placeholder='0'
                          value={localFilters.min_precio || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            setLocalFilters((prev) => ({
                              ...prev,
                              min_precio:
                                value === '' || value === '0' ? '' : value
                            }))
                          }}
                          className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                        />
                      </div>
                    </div>

                    {/* Precio Máximo */}
                    <div>
                      <label className='block text-xs text-gray-500 mb-1'>
                        Precio Máximo
                      </label>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm'>
                          Bs
                        </span>
                        <input
                          type='number'
                          min='0'
                          placeholder='Sin límite'
                          value={localFilters.max_precio || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            setLocalFilters((prev) => ({
                              ...prev,
                              max_precio:
                                value === '' || value === '0' ? '' : value
                            }))
                          }}
                          className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                        />
                      </div>
                    </div>

                    {/* Botones de precios rápidos */}
                    <div className='grid grid-cols-2 gap-2 pt-2'>
                      <button
                        onClick={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            min_precio: '1000'
                          }))
                        }
                        className='text-xs py-1.5 px-2 rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors'
                      >
                        Desde Bs 1,000
                      </button>
                      <button
                        onClick={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            min_precio: '5000'
                          }))
                        }
                        className='text-xs py-1.5 px-2 rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors'
                      >
                        Desde Bs 5,000
                      </button>
                      <button
                        onClick={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            max_precio: '10000'
                          }))
                        }
                        className='text-xs py-1.5 px-2 rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors'
                      >
                        Hasta Bs 10,000
                      </button>
                      <button
                        onClick={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            max_precio: '20000'
                          }))
                        }
                        className='text-xs py-1.5 px-2 rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors'
                      >
                        Hasta Bs 20,000
                      </button>
                    </div>

                    {/* Botón para limpiar precios */}
                    {(localFilters.min_precio || localFilters.max_precio) && (
                      <button
                        onClick={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            min_precio: '',
                            max_precio: ''
                          }))
                        }
                        className='w-full text-xs text-red-600 hover:text-red-700 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors'
                      >
                        Limpiar precios
                      </button>
                    )}
                  </div>
                </div>

                {/* Stock - MEJORADO */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Disponibilidad
                  </label>
                  <div className='flex gap-2'>
                    <button
                      onClick={() =>
                        setLocalFilters((prev) => ({ ...prev, en_stock: '' }))
                      }
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        !localFilters.en_stock
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          en_stock: 'true'
                        }))
                      }
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        localFilters.en_stock === 'true'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      En stock
                    </button>
                    <button
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          en_stock: 'false'
                        }))
                      }
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        localFilters.en_stock === 'false'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Sin stock
                    </button>
                  </div>
                </div>

                {/* Botón Buscar Principal */}
                <button
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50'
                >
                  {loading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className='w-4 h-4' />
                      Buscar Productos
                    </>
                  )}
                </button>

                {/* Botón aplicar para mobile */}
                <button
                  onClick={() => {
                    handleApplyFilters()
                    setShowFilters(false)
                  }}
                  className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:hidden'
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className='flex-1'>
            {/* Barra de Herramientas */}
            <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div className='flex items-center gap-4'>
                  {/* Botón Filtros Mobile */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className='lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center'
                  >
                    <Filter className='w-4 h-4 mr-2' />
                    Filtros
                  </button>

                  <span className='text-sm text-gray-600'>
                    {pagination.count} productos
                  </span>
                </div>

                <div className='flex items-center gap-4'>
                  {/* Select Orden */}
                  <select className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                    <option>Ordenar por: Más recientes</option>
                    <option>Precio: Menor a mayor</option>
                    <option>Precio: Mayor a menor</option>
                    <option>Nombre: A-Z</option>
                  </select>

                  {/* Vista Grid/List */}
                  <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600'
                      }`}
                    >
                      <Grid className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600'
                      }`}
                    >
                      <List className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className='bg-white rounded-lg shadow-sm border animate-pulse'
                  >
                    <div className='bg-gray-200 h-48 rounded-t-lg'></div>
                    <div className='p-4'>
                      <div className='bg-gray-200 h-4 rounded w-3/4 mb-2'></div>
                      <div className='bg-gray-200 h-4 rounded w-1/2 mb-3'></div>
                      <div className='bg-gray-200 h-6 rounded w-1/3'></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
                <p className='text-red-600'>{error}</p>
                <button
                  onClick={() => buscar()}
                  className='mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Productos */}
            {!loading && !error && (
              <>
                {productos.length === 0 ? (
                  <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Search className='w-8 h-8 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      No se encontraron productos
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Intenta ajustar los filtros de búsqueda
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Grid/List de Productos */}
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                          : 'space-y-6'
                      }
                    >
                      {productos.map((producto) =>
                        viewMode === 'grid' ? (
                          <ProductoCard key={producto.id} producto={producto} />
                        ) : (
                          <ProductoListItem
                            key={producto.id}
                            producto={producto}
                          />
                        )
                      )}
                    </div>

                    {/* Paginación */}
                    {pagination.total_pages > 1 && (
                      <div className='flex justify-center mt-12'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() =>
                              cambiarPagina(pagination.current_page - 1)
                            }
                            disabled={!pagination.has_previous}
                            className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            Anterior
                          </button>

                          {Array.from(
                            { length: pagination.total_pages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => cambiarPagina(page)}
                              className={`px-4 py-2 border rounded-lg ${
                                page === pagination.current_page
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() =>
                              cambiarPagina(pagination.current_page + 1)
                            }
                            disabled={!pagination.has_next}
                            className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Filtros Mobile */}
      {showFilters && (
        <div className='fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden'>
          <div className='fixed right-0 top-0 h-full w-80 bg-white overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-lg font-semibold'>Filtros</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Los mismos filtros que en el sidebar desktop */}
              <div className='space-y-6'>
                {/* Búsqueda */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Buscar producto
                  </label>
                  <div className='relative'>
                    <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <input
                      type='text'
                      defaultValue={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder='Nombre, modelo...'
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Categoría
                  </label>
                  <select
                    value={filters.categoria || ''}
                    onChange={(e) =>
                      handleFilterChange('categoria', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Todas las categorías</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marca */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Marca
                  </label>
                  <select
                    value={filters.marca || ''}
                    onChange={(e) =>
                      handleFilterChange('marca', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Todas las marcas</option>
                    {marcas.map((marca) => (
                      <option key={marca.id} value={marca.id}>
                        {marca.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Disponibilidad
                  </label>
                  <select
                    value={filters.en_stock || ''}
                    onChange={(e) =>
                      handleFilterChange('en_stock', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Todos</option>
                    <option value='true'>En stock</option>
                    <option value='false'>Sin stock</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowFilters(false)}
                  className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold'
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductCatalogPage
