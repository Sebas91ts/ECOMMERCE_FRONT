import React, { useState, useEffect } from 'react'
import {
  getMarcas,
  crearMarca,
  editarMarca,
  eliminarMarca,
  activarMarca
} from '../../api/productos/marcas'
import { Plus, Edit, Trash2, CheckCircle, Loader, X, Tags } from 'lucide-react'

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
        <X size={18} />
      </button>
    </div>
  )
}

// -----------------------------------------------------
// 🏷️ COMPONENTE PRINCIPAL: MarcaManager
// -----------------------------------------------------

const MarcaManager = () => {
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMarca, setCurrentMarca] = useState(null) // Para edición
  const [nombreMarca, setNombreMarca] = useState('') // Campo del formulario
  const [notification, setNotification] = useState(null)

  // --- Helpers ---
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // --- Cargar datos ---
  const fetchData = async () => {
    setLoading(true)
    try {
      // Usamos listar_marcas para obtener tanto activas como inactivas
      const response = await getMarcas()
      setMarcas(response.data.values.marcas)
    } catch (error) {
      console.error('Error fetching marcas:', error)
      showNotification('Error al cargar la lista de marcas.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- Apertura/Cierre del Modal ---
  const handleOpenModal = (marca = null) => {
    if (marca) {
      setCurrentMarca(marca)
      setNombreMarca(marca.nombre)
    } else {
      setCurrentMarca(null)
      setNombreMarca('')
    }
    setIsModalOpen(true)
  }

  // --- Envío del Formulario (Crear/Editar) ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const data = { nombre: nombreMarca }

    try {
      let response
      if (currentMarca) {
        response = await editarMarca(currentMarca.id, data)
      } else {
        response = await crearMarca(data)
      }

      if (response.data.status === 1) {
        showNotification(response.data.message, 'success')
        setIsModalOpen(false)
        fetchData() // Recargar la lista
      } else {
        // Manejo de errores de validación (ej: nombre repetido)
        const errorMsg = response.data.values.nombre
          ? response.data.values.nombre[0]
          : response.data.message
        showNotification(`Error: ${errorMsg}`, 'error')
      }
    } catch (error) {
      showNotification('Hubo un error de conexión o servidor.', `${error}`)
    } finally {
      setLoading(false)
    }
  }

  // --- Manejo de Estado (Activar/Desactivar) ---
  const handleToggleActive = async (id, isActive) => {
    setLoading(true)
    try {
      const apiCall = isActive ? eliminarMarca : activarMarca
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
      <h1 className='text-3xl font-bold text-gray-900 mb-2 tracking-tight flex items-center'>
        <Tags size={28} className='mr-3 text-indigo-600' /> Gestión de Marcas
      </h1>
      <p className='text-gray-600 mb-8 max-w-3xl text-sm'>
        Administra las marcas de electrodomésticos disponibles para los
        productos.
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
          Crear Nueva Marca
        </button>
      </div>

      {/* Tabla de Marcas */}
      <div className='bg-white shadow-xl rounded-xl overflow-x-auto'>
        {loading && (
          <div className='p-4 text-center text-indigo-600 font-medium flex items-center justify-center'>
            <Loader size={20} className='animate-spin mr-2' /> Cargando
            marcas...
          </div>
        )}
        {!loading && marcas.length === 0 ? (
          <div className='p-10 text-center text-gray-500'>
            No se encontraron marcas.
          </div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Nombre de Marca
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
              {marcas.map((marca) => (
                <tr
                  key={marca.id}
                  className={!marca.is_active ? 'bg-red-50 opacity-70' : ''}
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-16'>
                    {marca.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {marca.nombre}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        marca.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {marca.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2'>
                    <button
                      onClick={() => handleOpenModal(marca)}
                      className='text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100 transition duration-150'
                      title='Editar'
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleToggleActive(marca.id, marca.is_active)
                      }
                      className={`p-1 rounded-full hover:bg-gray-100 transition duration-150 ${
                        marca.is_active
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={marca.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {marca.is_active ? (
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

      {/* --- Modal para Crear/Editar Marca --- */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300'>
          <div className='bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all'>
            <h3 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-2'>
              {currentMarca ? 'Editar Marca' : 'Crear Nueva Marca'}
            </h3>
            <form onSubmit={handleSubmit}>
              {/* Nombre */}
              <div className='mb-6'>
                <label
                  htmlFor='nombre'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Nombre de Marca
                </label>
                <input
                  type='text'
                  name='nombre'
                  id='nombre'
                  value={nombreMarca}
                  onChange={(e) => setNombreMarca(e.target.value)}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Ej: Samsung, LG, Whirlpool'
                />
              </div>

              {/* Botones de Acción */}
              <div className='flex justify-end space-x-3 pt-4'>
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
                  disabled={loading || nombreMarca.trim() === ''}
                >
                  {loading && (
                    <Loader size={18} className='animate-spin mr-2' />
                  )}
                  {currentMarca ? 'Guardar Cambios' : 'Crear Marca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarcaManager
