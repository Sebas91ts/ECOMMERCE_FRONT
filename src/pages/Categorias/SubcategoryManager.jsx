import React, { useState, useEffect } from 'react'
import {
  getSubcategorias,
  crearSubcategoria,
  editarSubcategoria,
  eliminarSubcategoria,
  activarSubcategoria
} from '../../api/productos/subcategoria'
import { getCategoriasActivas } from '../../api/productos/categoria'
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader,
  XCircle,
  ListTree
} from 'lucide-react' // Íconos de Lucide React

// --- Componente de Notificación Simple (Reutilizado) ---
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
        <XCircle size={18} />
      </button>
    </div>
  )
}

// -----------------------------------------------------
// 📦 COMPONENTE PRINCIPAL: SubcategoryManager
// -----------------------------------------------------

const SubcategoryManager = () => {
  const [subcategorias, setSubcategorias] = useState([])
  const [categorias, setCategorias] = useState([]) // Lista para el select
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSubcategory, setCurrentSubcategory] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', categoria: '' }) // 'categoria' es el ID
  const [notification, setNotification] = useState(null)

  // --- Cargar Subcategorías y Categorías para el Select ---
  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Obtener todas las Subcategorías
      const subResponse = await getSubcategorias()
      // 2. Obtener Categorías Activas (para el dropdown del formulario)
      const catResponse = await getCategoriasActivas()
      console.log(catResponse)

      if (subResponse.data.status === 1) {
        setSubcategorias(subResponse.data.values.subcategorias)
      }
      if (catResponse.data.status === 1) {
        setCategorias(catResponse.data.values.categorias)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification(
        'Error al cargar datos. Verifique la conexión API.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- Helpers ---
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const getCategoryName = (categoryId) => {
    const cat = categorias.find((c) => c.id === categoryId)
    return cat ? cat.nombre : 'N/A'
  }

  // --- Manejo del Formulario (Crear/Editar) ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleOpenModal = (subcat = null) => {
    if (subcat) {
      setCurrentSubcategory(subcat)
      // Asigna el ID de la categoría (el campo 'categoria' en la respuesta de Django es un objeto si usas Serializer, si es un ID simple, usa subcat.categoria)
      // Asumiendo que la respuesta incluye el ID de la categoría: subcat.categoria_id o subcat.categoria.id
      const catId =
        subcat.categoria && subcat.categoria.id
          ? subcat.categoria.id
          : subcat.categoria

      setFormData({
        nombre: subcat.nombre,
        // Asegúrate de que el valor sea una cadena para el <select>
        categoria: String(catId || '')
      })
    } else {
      setCurrentSubcategory(null)
      // Inicializa con la primera categoría activa si existe
      setFormData({
        nombre: '',
        categoria: categorias.length > 0 ? String(categorias[0].id) : ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Convertir el ID de la categoría a entero antes de enviar
    const dataToSend = { ...formData, categoria: parseInt(formData.categoria) }

    try {
      let response
      if (currentSubcategory) {
        // Editar (PATCH)
        response = await editarSubcategoria(currentSubcategory.id, dataToSend)
      } else {
        // Crear (POST)
        response = await crearSubcategoria(dataToSend)
      }

      if (response.data.status === 1) {
        showNotification(response.data.message, 'success')
        setIsModalOpen(false)
        fetchData() // Recargar la lista
      } else {
        showNotification(
          'Error al procesar: ' +
            (response.data.message || JSON.stringify(response.data.values)),
          'error'
        )
      }
    } catch (error) {
      console.error('Error submitting subcategory:', error)
      showNotification('Error de conexión o datos inválidos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Manejo de Estado (Activar/Desactivar) ---
  const handleToggleActive = async (id, isActive) => {
    setLoading(true)
    try {
      const apiCall = isActive ? eliminarSubcategoria : activarSubcategoria
      const response = await apiCall(id)

      if (response.data.status === 1) {
        showNotification(response.data.message, 'success')
        fetchData()
      } else {
        showNotification(response.data.message, 'error')
      }
    } catch (error) {
      showNotification('Error de conexión al cambiar el estado.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Estructura Visual ---
  return (
    <div className='py-2'>
      {' '}
      {/* Quitamos el padding vertical grande, ya que el Outlet lo maneja */}
      <h1 className='text-3xl font-bold text-gray-900 mb-2 tracking-tight'>
        Administración de Subcategorías
      </h1>
      <p className='text-gray-600 mb-8 max-w-3xl text-sm'>
        Organiza los productos asignando subcategorías (Ej: Refrigeradores,
        Congeladores) a sus categorías principales (Ej: Refrigeración).
      </p>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Encabezado y Botón Crear */}
      <div className='flex justify-end mb-6'>
        <button
          onClick={() => handleOpenModal()}
          className='flex items-center bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-teal-700 transition duration-200'
          disabled={loading || categorias.length === 0}
        >
          <Plus size={20} className='mr-2' />
          Crear Nueva Subcategoría
        </button>
      </div>
      {/* Tabla de Subcategorías */}
      <div className='bg-white shadow-xl rounded-xl overflow-x-auto'>
        {loading && (
          <div className='p-4 text-center text-teal-600 font-medium flex items-center justify-center'>
            <Loader size={20} className='animate-spin mr-2' /> Cargando
            subcategorías...
          </div>
        )}
        {!loading && subcategorias.length === 0 ? (
          <div className='p-10 text-center text-gray-500'>
            No se encontraron subcategorías.
          </div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Nombre
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell'>
                  Categoría Padre
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
              {subcategorias.map((subcat) => (
                <tr
                  key={subcat.id}
                  className={!subcat.is_active ? 'bg-red-50 opacity-70' : ''}
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center'>
                    <ListTree size={16} className='mr-2 text-gray-400' />
                    {subcat.nombre}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell'>
                    {/* Accediendo al ID de la Categoría y buscando el nombre */}
                    {getCategoryName(subcat.categoria)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subcat.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {subcat.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2'>
                    <button
                      onClick={() => handleOpenModal(subcat)}
                      className='text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100 transition duration-150'
                      title='Editar'
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleToggleActive(subcat.id, subcat.is_active)
                      }
                      className={`p-1 rounded-full hover:bg-gray-100 transition duration-150 ${
                        subcat.is_active
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={subcat.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {subcat.is_active ? (
                        <Trash2 size={18} />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* --- Modal para Crear/Editar Subcategoría --- */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 p-4'>
          <div className='bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all'>
            <h3 className='text-2xl font-bold text-gray-900 mb-4'>
              {currentSubcategory
                ? 'Editar Subcategoría'
                : 'Crear Nueva Subcategoría'}
            </h3>
            <form onSubmit={handleSubmit}>
              {/* Campo Categoria Padre */}
              <div className='mb-4'>
                <label
                  htmlFor='categoria'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Categoría Padre
                </label>
                <select
                  name='categoria'
                  id='categoria'
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150'
                  disabled={loading || categorias.length === 0}
                >
                  {categorias.length === 0 && (
                    <option value=''>Cargando Categorías...</option>
                  )}
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo Nombre de Subcategoría */}
              <div className='mb-6'>
                <label
                  htmlFor='nombre'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Nombre de Subcategoría
                </label>
                <input
                  type='text'
                  name='nombre'
                  id='nombre'
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150'
                  placeholder='Ej: Refrigerador No Frost'
                />
              </div>

              <div className='flex justify-end space-x-3'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150'
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center'
                  disabled={loading}
                >
                  {loading && (
                    <Loader size={18} className='animate-spin mr-2' />
                  )}
                  {currentSubcategory
                    ? 'Guardar Cambios'
                    : 'Crear Subcategoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubcategoryManager
