import React, { useState, useEffect } from 'react'
import {
  crearProducto,
  editarProducto,
  eliminarProducto,
  activarProducto,
  buscarProductos
} from '../../api/productos/producto'
import { getCategoriasActivas } from '../../api/productos/categoria'
import { getSubcategoriasActivas } from '../../api/productos/subcategoria'
import { getMarcasActivas } from '../../api/productos/marcas'
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader,
  X,
  Camera,
  Package,
  DollarSign,
  Zap,
  Search,
  Filter,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// --- Componente de Notificación Simple ---
const Notification = ({ message, type, onClose }) => {
  const baseStyle =
    'p-4 rounded-lg shadow-md mb-4 flex justify-between items-center'
  let colorStyle = ''

  switch (type) {
    case 'success':
      colorStyle = 'bg-green-100 border-l-4 border-green-500 text-green-700'
      break
    case 'error':
      colorStyle = 'bg-red-100 border-l-4 border-red-500 text-red-700'
      break
    default:
      colorStyle = 'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
  }

  return (
    <div className={`${baseStyle} ${colorStyle}`}>
      <span>{message}</span>
      <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
        <X size={18} />
      </button>
    </div>
  )
}

// --- Componente de Paginación ---
const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.total_pages <= 1) return null

  return (
    <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white'>
      <div className='text-sm text-gray-700'>
        Mostrando página {pagination.current_page} de {pagination.total_pages}(
        {pagination.count} productos totales)
      </div>
      <div className='flex space-x-2'>
        <button
          onClick={() => onPageChange(pagination.previous_page)}
          disabled={!pagination.has_previous}
          className={`px-3 py-1 rounded border ${
            pagination.has_previous
              ? 'bg-white text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={16} />
        </button>

        {[...Array(pagination.total_pages)].map((_, index) => {
          const page = index + 1
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded border ${
                page === pagination.current_page
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        })}

        <button
          onClick={() => onPageChange(pagination.next_page)}
          disabled={!pagination.has_next}
          className={`px-3 py-1 rounded border ${
            pagination.has_next
              ? 'bg-white text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// -----------------------------------------------------
// 📦 COMPONENTE PRINCIPAL: ProductManager
// -----------------------------------------------------
const ProductManager = () => {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)

  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    subcategoria: '',
    marca: '',
    activos: true,
    page: 1,
    page_size: 10
  })
  const [pagination, setPagination] = useState(null)

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    modelo: '',
    precio_contado: '',
    precio_cuota: '',
    stock: '',
    garantia_meses: '',
    subcategoria_id: '',
    marca_id: ''
  })

  const [newImages, setNewImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [notification, setNotification] = useState(null)

  // --- Helpers ---
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // --- Cargar datos de catálogos ---
  const fetchCatalogos = async () => {
    try {
      const [catRes, subcatRes, marcaRes] = await Promise.all([
        getCategoriasActivas(),
        getSubcategoriasActivas(),
        getMarcasActivas()
      ])

      setCategorias(catRes.data.values.categorias)
      setSubcategorias(subcatRes.data.values.subcategorias)
      setMarcas(marcaRes.data.values.marcas)
    } catch (error) {
      console.error('Error fetching catalogos:', error)
      showNotification('Error al cargar catálogos.', 'error')
    }
  }

  // --- Búsqueda de productos con filtros ---
  const buscarProductosConFiltros = async (newFilters = {}) => {
    setLoading(true)
    try {
      const mergedFilters = {
        ...filters,
        ...newFilters,
        page: newFilters.page || 1
      }
      setFilters(mergedFilters)

      const response = await buscarProductos(mergedFilters)

      if (response.data.status === 1) {
        setProductos(response.data.values.productos)
        setPagination(response.data.values.pagination)
      } else {
        showNotification('Error en la búsqueda.', 'error')
      }
    } catch (error) {
      console.error('Error buscando productos:', error)
      showNotification('Error al buscar productos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Cargar datos iniciales ---
  useEffect(() => {
    fetchCatalogos()
    buscarProductosConFiltros()
  }, [])

  // --- Handlers de filtros ---
  const handleSearchChange = (value) => {
    buscarProductosConFiltros({
      search: value,
      categoria: filters.categoria,
      subcategoria: filters.subcategoria,
      marca: filters.marca,
      activos: filters.activos,
      page: 1
    })
  }

  const handleCategoriaChange = (value) => {
    buscarProductosConFiltros({
      search: filters.search,
      categoria: value,
      subcategoria: filters.subcategoria,
      marca: filters.marca,
      activos: filters.activos,
      page: 1
    })
  }

  const handleSubcategoriaChange = (value) => {
    buscarProductosConFiltros({
      search: filters.search,
      categoria: filters.categoria,
      subcategoria: value,
      marca: filters.marca,
      activos: filters.activos,
      page: 1
    })
  }

  const handleMarcaChange = (value) => {
    buscarProductosConFiltros({
      search: filters.search,
      categoria: filters.categoria,
      subcategoria: filters.subcategoria,
      marca: value,
      activos: filters.activos,
      page: 1
    })
  }

  const handleToggleActive = (isActive) => {
    buscarProductosConFiltros({
      search: filters.search,
      categoria: filters.categoria,
      subcategoria: filters.subcategoria,
      marca: filters.marca,
      activos: isActive,
      page: 1
    })
  }

  const handlePageChange = (page) => {
    if (page) {
      buscarProductosConFiltros({ page })
    }
  }

  // --- Limpiar filtros ---
  const clearFilters = () => {
    const nuevosFiltros = {
      search: '',
      categoria: '',
      subcategoria: '',
      marca: '',
      activos: true,
      page: 1,
      page_size: 20
    }
    setFilters(nuevosFiltros)
    buscarProductosConFiltros(nuevosFiltros)
  }

  // --- Manejo del Formulario ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes('precio') ||
        name.includes('stock') ||
        name.includes('garantia')
          ? value === ''
            ? ''
            : Number(value)
          : value
    }))
  }

  // --- Manejo de Imágenes ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newFileList = files.map((file) => ({
      file,
      is_main: false,
      orden: 0
    }))
    setNewImages((prev) => [...prev, ...newFileList])
    e.target.value = null
  }

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSetMain = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) =>
        prev.map((img, i) => ({
          ...img,
          is_main: i === index,
          orden: i === index ? 1 : img.orden === 1 ? 2 : img.orden
        }))
      )
    } else {
      setNewImages((prev) =>
        prev.map((img, i) => ({
          ...img,
          is_main: i === index,
          orden: i === index ? 1 : img.orden === 1 ? 2 : img.orden
        }))
      )
    }
  }

  // --- Obtener imagen principal para previsualización ---
  const getMainImage = (product) => {
    if (product.imagenes_data && product.imagenes_data.length > 0) {
      const mainImage = product.imagenes_data.find((img) => img.is_main)
      return mainImage || product.imagenes_data[0]
    }
    return null
  }

  // --- Apertura/Cierre del Modal ---
  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product)
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        modelo: product.modelo || '',
        precio_contado: product.precio_contado || '',
        precio_cuota: product.precio_cuota || '',
        stock: product.stock || '',
        garantia_meses: product.garantia_meses || '',
        subcategoria_id: product.subcategoria_id || product.subcategoria || '',
        marca_id: product.marca_id || product.marca || ''
      })
      setExistingImages(product.imagenes_data || [])
      setNewImages([])
    } else {
      setCurrentProduct(null)
      setFormData({
        nombre: '',
        descripcion: '',
        modelo: '',
        precio_contado: '',
        precio_cuota: '',
        stock: '',
        garantia_meses: '',
        subcategoria_id: subcategorias.length > 0 ? subcategorias[0].id : '',
        marca_id: marcas.length > 0 ? marcas[0].id : ''
      })
      setExistingImages([])
      setNewImages([])
    }
    setIsModalOpen(true)
  }

  // --- Envío del Formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const form = new FormData()

    Object.keys(formData).forEach((key) => {
      let value = formData[key]
      if (value !== '' && value !== null && value !== undefined) {
        form.append(key, value)
      }
    })

    if (currentProduct) {
      form.append('is_active', currentProduct.is_active)
    }

    existingImages.forEach((img, index) => {
      form.append(`imagenes[${index}]id`, img.id)
      form.append(`imagenes[${index}]is_main`, img.is_main)
      form.append(`imagenes[${index}]orden`, img.orden)
    })

    newImages.forEach((img, indexOffset) => {
      const index = existingImages.length + indexOffset
      form.append(`imagenes[${index}]file`, img.file)
      form.append(`imagenes[${index}]is_main`, img.is_main)
      form.append(`imagenes[${index}]orden`, img.orden)
    })

    try {
      let response
      if (currentProduct) {
        response = await editarProducto(currentProduct.id, form)
      } else {
        response = await crearProducto(form)
      }

      if (response.data.status === 1) {
        showNotification(response.data.message, 'success')
        setIsModalOpen(false)
        // Recargar la búsqueda actual después de crear/editar
        buscarProductosConFiltros()
      } else {
        console.error(response.data.values)
        showNotification('Error de validación: Revise la consola.', 'error')
      }
    } catch (error) {
      console.error('Error al enviar el producto:', error)
      showNotification('Hubo un error de conexión o servidor.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Manejo de Estado ---
  const handleToggleActiveProduct = async (id, isActive) => {
    setLoading(true)
    try {
      const apiCall = isActive ? eliminarProducto : activarProducto
      const response = await apiCall(id)

      if (response.data.status === 1) {
        showNotification(response.data.message, 'success')
        // Recargar la búsqueda actual después de cambiar estado
        buscarProductosConFiltros()
      } else {
        showNotification(response.data.message, 'error')
      }
    } catch (error) {
      showNotification('Error de conexión al cambiar el estado.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='py-2'>
      <h1 className='text-3xl font-bold text-gray-900 mb-2 tracking-tight flex items-center'>
        <Package size={28} className='mr-3 text-indigo-600' /> Gestión Gestión
        de Productos
      </h1>
      <p className='text-gray-600 mb-8 max-w-3xl text-sm'>
        Administra el inventario de electrodomésticos, incluyendo precios, stock
        y galería de imágenes.
      </p>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Filtros y Controles */}
      <div className='bg-white p-6 rounded-xl shadow-md mb-6'>
        <div className='flex flex-col lg:flex-row gap-4 mb-4'>
          {/* Búsqueda por texto */}
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <Search size={16} className='inline mr-1' />
              Buscar productos
            </label>
            <input
              type='text'
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder='Buscar por nombre, modelo o descripción...'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>

          {/* Toggle Activos/Inactivos */}
          <div className='flex items-end'>
            <button
              onClick={() => handleToggleActive(!filters.activos)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                filters.activos
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-red-100 border-red-500 text-red-700'
              }`}
            >
              {filters.activos ? (
                <Eye size={16} className='mr-2' />
              ) : (
                <EyeOff size={16} className='mr-2' />
              )}
              {filters.activos ? 'Activos' : 'Inactivos'}
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Filtro por Categoría */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <Filter size={16} className='inline mr-1' />
              Categoría
            </label>
            <select
              value={filters.categoria}
              onChange={(e) => handleCategoriaChange(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
            >
              <option value=''>Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Subcategoría */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <Filter size={16} className='inline mr-1' />
              Subcategoría
            </label>
            <select
              value={filters.subcategoria}
              onChange={(e) => handleSubcategoriaChange(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
            >
              <option value=''>Todas las subcategorías</option>
              {subcategorias.map((subcat) => (
                <option key={subcat.id} value={subcat.id}>
                  {subcat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Marca */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <Filter size={16} className='inline mr-1' />
              Marca
            </label>
            <select
              value={filters.marca}
              onChange={(e) => handleMarcaChange(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
            >
              <option value=''>Todas las marcas</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador y limpiar filtros */}
        <div className='flex justify-between items-center mt-4'>
          <span className='text-sm text-gray-600'>
            {pagination
              ? `${pagination.count} productos totales`
              : 'Cargando...'}
          </span>
          <button
            onClick={clearFilters}
            className='text-sm text-indigo-600 hover:text-indigo-800'
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Encabezado y Botón Crear */}
      <div className='flex justify-between items-center mb-6'>
        <div className='text-sm text-gray-600'>
          {pagination &&
            `Página ${pagination.current_page} de ${pagination.total_pages}`}
        </div>
        <button
          onClick={() => handleOpenModal()}
          className='flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200'
          disabled={loading}
        >
          <Plus size={20} className='mr-2' />
          Crear Nuevo Producto
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className='bg-white shadow-xl rounded-xl overflow-hidden'>
        {loading && (
          <div className='p-4 text-center text-indigo-600 font-medium flex items-center justify-center'>
            <Loader size={20} className='animate-spin mr-2' /> Cargando
            productos...
          </div>
        )}
        {!loading && productos.length === 0 ? (
          <div className='p-10 text-center text-gray-500'>
            No se encontraron productos.
          </div>
        ) : (
          <>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Imagen
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Producto
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Categoría / Subcategoría / Marca
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
                    Stock
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32'>
                    Precio (Contado)
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
                    Estado
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {productos.map((prod) => {
                  const mainImage = getMainImage(prod)
                  return (
                    <tr
                      key={prod.id}
                      className={!prod.is_active ? 'bg-red-50 opacity-70' : ''}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {mainImage ? (
                          <img
                            src={mainImage.url_imagen}
                            alt={prod.nombre}
                            className='w-12 h-12 object-cover rounded-lg border'
                          />
                        ) : (
                          <div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center'>
                            <Camera size={20} className='text-gray-400' />
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        <div className='font-semibold'>{prod.nombre}</div>
                        <div className='text-xs text-gray-500'>
                          Mod: {prod.modelo}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <div className='font-medium'>
                          {prod.categoria_nombre || 'Sin categoría'}
                        </div>
                        <div className='text-sm text-gray-600'>
                          {prod.subcategoria_nombre || 'Sin subcategoría'}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {prod.marca_nombre || 'Sin marca'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-bold'>
                        {prod.stock || 0}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span className='font-semibold text-green-700'>
                          ${prod.precio_contado || '0.00'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            prod.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prod.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2'>
                        <button
                          onClick={() => handleOpenModal(prod)}
                          className='text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100 transition duration-150'
                          title='Editar'
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleActiveProduct(prod.id, prod.is_active)
                          }
                          className={`p-1 rounded-full hover:bg-gray-100 transition duration-150 ${
                            prod.is_active
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={prod.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {prod.is_active ? (
                            <Trash2 size={18} />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Paginación */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Modal para Crear/Editar Producto - Se mantiene igual */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 p-4'>
          <div className='bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto'>
            <h3 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-2'>
              {currentProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Columna 1: Información Básica */}
                <div className='md:col-span-2 space-y-4'>
                  <h4 className='text-lg font-semibold text-gray-700'>
                    Información General
                  </h4>

                  {/* Nombre */}
                  <div>
                    <label
                      htmlFor='nombre'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Nombre del Producto
                    </label>
                    <input
                      type='text'
                      name='nombre'
                      id='nombre'
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                      placeholder='Ej: Nevera No Frost Modelo X'
                    />
                  </div>

                  {/* Modelo */}
                  <div>
                    <label
                      htmlFor='modelo'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Modelo
                    </label>
                    <input
                      type='text'
                      name='modelo'
                      id='modelo'
                      value={formData.modelo}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                      placeholder='Ej: NF-7500'
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label
                      htmlFor='descripcion'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Descripción
                    </label>
                    <textarea
                      name='descripcion'
                      id='descripcion'
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows='3'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                      placeholder='Características principales, capacidad, tecnología...'
                    />
                  </div>

                  {/* Subcategoría y Marca */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='subcategoria_id'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Subcategoría
                      </label>
                      <select
                        name='subcategoria_id'
                        id='subcategoria_id'
                        value={formData.subcategoria_id}
                        onChange={handleInputChange}
                        required
                        className='w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                      >
                        <option value=''>Seleccione Subcategoría</option>
                        {subcategorias.map((subcat) => (
                          <option key={subcat.id} value={subcat.id}>
                            {subcat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor='marca_id'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Marca
                      </label>
                      <select
                        name='marca_id'
                        id='marca_id'
                        value={formData.marca_id}
                        onChange={handleInputChange}
                        required
                        className='w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                      >
                        <option value=''>Seleccione Marca</option>
                        {marcas.map((marca) => (
                          <option key={marca.id} value={marca.id}>
                            {marca.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Precios y Stock */}
                <div className='md:col-span-1 space-y-4 bg-gray-50 p-4 rounded-lg'>
                  <h4 className='text-lg font-semibold text-gray-700 flex items-center'>
                    <DollarSign size={18} className='mr-2' /> Datos Financieros
                  </h4>

                  {/* Precio Contado */}
                  <div>
                    <label
                      htmlFor='precio_contado'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Precio Contado ($)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='precio_contado'
                      id='precio_contado'
                      value={formData.precio_contado}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                    />
                  </div>

                  {/* Precio Cuota */}
                  <div>
                    <label
                      htmlFor='precio_cuota'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Precio Cuota ($)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='precio_cuota'
                      id='precio_cuota'
                      value={formData.precio_cuota}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label
                      htmlFor='stock'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Stock Disponible
                    </label>
                    <input
                      type='number'
                      name='stock'
                      id='stock'
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                    />
                  </div>

                  {/* Garantía */}
                  <div>
                    <label
                      htmlFor='garantia_meses'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Garantía (Meses)
                    </label>
                    <input
                      type='number'
                      name='garantia_meses'
                      id='garantia_meses'
                      value={formData.garantia_meses}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                    />
                  </div>
                </div>
              </div>

              {/* Sección de Imágenes - Se mantiene igual */}
              <div className='mt-8 pt-6 border-t border-gray-200'>
                <h4 className='text-lg font-semibold text-gray-700 flex items-center mb-4'>
                  <Camera size={18} className='mr-2' /> Galería de Imágenes
                </h4>

                {/* Lista de Imágenes Existentes */}
                {existingImages.length > 0 && (
                  <div className='mb-4 p-4 border border-indigo-100 rounded-lg bg-indigo-50'>
                    <p className='text-sm font-medium text-indigo-700 mb-2'>
                      Imágenes Actuales (Se mantendrán a menos que se eliminen):
                    </p>
                    <div className='flex flex-wrap gap-4'>
                      {existingImages.map((img, index) => (
                        <div
                          key={img.id}
                          className='relative w-24 h-24 border rounded-lg overflow-hidden shadow-sm'
                        >
                          <img
                            src={img.url_imagen}
                            alt={`Existente ${index}`}
                            className='w-full h-full object-cover'
                          />
                          {img.is_main && (
                            <span className='absolute top-0 left-0 bg-yellow-500 text-xs text-white px-1'>
                              Principal
                            </span>
                          )}
                          <button
                            type='button'
                            onClick={() => handleRemoveImage(index, true)}
                            title='Eliminar esta imagen'
                            className='absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition'
                          >
                            <X size={12} />
                          </button>
                          <button
                            type='button'
                            onClick={() => handleSetMain(index, true)}
                            title='Establecer como principal'
                            className='absolute bottom-1 left-1 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-1 transition'
                          >
                            <Zap size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de Nuevas Imágenes */}
                {newImages.length > 0 && (
                  <div className='mb-4 p-4 border border-green-100 rounded-lg bg-green-50'>
                    <p className='text-sm font-medium text-green-700 mb-2'>
                      Imágenes Nuevas (Se subirán a Cloudinary):
                    </p>
                    <div className='flex flex-wrap gap-4'>
                      {newImages.map((img, index) => (
                        <div
                          key={index}
                          className='relative w-24 h-24 border rounded-lg overflow-hidden shadow-sm'
                        >
                          <img
                            src={URL.createObjectURL(img.file)}
                            alt={`Nueva ${index}`}
                            className='w-full h-full object-cover'
                          />
                          {img.is_main && (
                            <span className='absolute top-0 left-0 bg-yellow-500 text-xs text-white px-1'>
                              Principal
                            </span>
                          )}
                          <button
                            type='button'
                            onClick={() => handleRemoveImage(index, false)}
                            title='Eliminar esta nueva imagen'
                            className='absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition'
                          >
                            <X size={12} />
                          </button>
                          <button
                            type='button'
                            onClick={() => handleSetMain(index, false)}
                            title='Establecer como principal'
                            className='absolute bottom-1 left-1 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-1 transition'
                          >
                            <Zap size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input para subir archivos */}
                <div>
                  <label
                    htmlFor='files'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Añadir Archivos de Imagen
                  </label>
                  <input
                    type='file'
                    id='files'
                    onChange={handleFileChange}
                    multiple
                    accept='image/*'
                    className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className='flex justify-end space-x-3 mt-8 pt-4 border-t'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150'
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center'
                  disabled={loading}
                >
                  {loading && (
                    <Loader size={18} className='animate-spin mr-2' />
                  )}
                  {currentProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManager
