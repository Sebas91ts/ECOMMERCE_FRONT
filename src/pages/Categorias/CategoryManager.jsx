import React, { useState, useEffect } from 'react'
import {
  getCategorias,
  crearCategoria,
  editarCategoria,
  eliminarCategoria,
  activarCategoria
} from '../../api/productos/categoria'
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader } from 'lucide-react'

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
        <XCircle size={18} />
      </button>
    </div>
  )
}

// -----------------------------------------------------
// 📦 COMPONENTE PRINCIPAL: CategoryManager
// -----------------------------------------------------

const CategoryManager = () => {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null) // Para edición
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })
  const [notification, setNotification] = useState(null)

  // --- Cargar datos de la API ---
  const fetchCategorias = async () => {
    setLoading(true)
    try {
      // Usamos listar_categorias para obtener activas e inactivas
      const response = await getCategorias()
      if (response.data.status === 1) {
        setCategorias(response.data.values.categorias)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      showNotification('Error al cargar las categorías.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  // --- Manejo de Notificaciones ---
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // --- Manejo del Formulario (Crear/Editar) ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setCurrentCategory(category)
      setFormData({
        nombre: category.nombre,
        descripcion: category.descripcion || ''
      })
    } else {
      setCurrentCategory(null)
      setFormData({ nombre: '', descripcion: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let response
      if (currentCategory) {
        // Editar (PATCH)
        response = await editarCategoria(currentCategory.id, formData)
      } else {
        // Crear (POST)
        response = await crearCategoria(formData)
      }

      if (response.data.status === 1) {
        showNotification(response.data.message, 'success')
        setIsModalOpen(false)
        fetchCategorias() // Recargar la lista
      } else {
        // Manejar errores de validación del backend (ej: nombre ya existe)
        const errorMsg =
          response.data.message || 'Error desconocido al procesar la categoría.'
        showNotification(errorMsg, 'error')
      }
    } catch (error) {
      console.error('Error submitting category:', error)
      showNotification('Hubo un error de conexión o servidor.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Manejo de Estado (Activar/Desactivar) ---
  const handleToggleActive = async (id, isActive) => {
    setLoading(true)
    try {
      const apiCall = isActive ? eliminarCategoria : activarCategoria // eliminarCategoria hace PATCH is_active=False
      const response = await apiCall(id)

      if (response.data.status === 1) {
        showNotification(response.data.message, 'success')
        fetchCategorias()
      } else {
        showNotification(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      showNotification('Error de conexión al cambiar el estado.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Estructura Visual ---
  return (
    <div className='max-w-7xl mx-auto sm:px-6 lg:px-8'>
      <h1 className='text-4xl font-extrabold text-gray-900 mb-6 tracking-tight'>
        Gestión de Categorías de Electrodomésticos
      </h1>
      <p className='text-gray-600 mb-8 max-w-2xl'>
        Administra las categorías principales como Refrigeración, Cocina y
        Lavado. Usa el botón de estado para activar o desactivar la visibilidad
        de la categoría en el frontend.
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
          className='flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200'
          disabled={loading}
        >
          <Plus size={20} className='mr-2' />
          Crear Nueva Categoría
        </button>
      </div>

      {/* Tabla de Categorías */}
      <div className='bg-white shadow-xl rounded-xl overflow-hidden'>
        {loading && (
          <div className='p-4 text-center text-indigo-600 font-medium flex items-center justify-center'>
            <Loader size={20} className='animate-spin mr-2' /> Cargando
            categorías...
          </div>
        )}
        {!loading && categorias.length === 0 ? (
          <div className='p-10 text-center text-gray-500'>
            No se encontraron categorías.
          </div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Nombre
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell'>
                  Descripción
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
              {categorias.map((cat) => (
                <tr
                  key={cat.id}
                  className={!cat.is_active ? 'bg-red-50 opacity-70' : ''}
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {cat.nombre}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell'>
                    {cat.descripcion || 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cat.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cat.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2'>
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className='text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100 transition duration-150'
                      title='Editar'
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(cat.id, cat.is_active)}
                      className={`p-1 rounded-full hover:bg-gray-100 transition duration-150 ${
                        cat.is_active
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={cat.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {cat.is_active ? (
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

      {/* --- Modal para Crear/Editar Categoría --- */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all'>
            <h3 className='text-2xl font-bold text-gray-900 mb-4'>
              {currentCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label
                  htmlFor='nombre'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Nombre
                </label>
                <input
                  type='text'
                  name='nombre'
                  id='nombre'
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150'
                  placeholder='Ej: Refrigeración'
                />
              </div>
              <div className='mb-6'>
                <label
                  htmlFor='descripcion'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Descripción (Opcional)
                </label>
                <textarea
                  name='descripcion'
                  id='descripcion'
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows='3'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150'
                  placeholder='Ej: Neveras, congeladores y enfriadores de vino.'
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
                  {currentCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManager
