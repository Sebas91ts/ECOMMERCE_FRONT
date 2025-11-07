import { Pencil, RefreshCw, Plus, Trash2, Power, PowerOff } from 'lucide-react'
import { useComponentes } from '../../hooks/useComponentes'
import { useState } from 'react'

export default function Componentes() {
  const {
    componentes,
    loading,
    error,
    crear,
    editar,
    eliminar,
    fetchComponentes
  } = useComponentes()

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [currentComponente, setCurrentComponente] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  })

  const openCrearModal = () => {
    setModalType('crear')
    setFormData({ nombre: '', descripcion: '' })
    setShowModal(true)
  }

  const openEditarModal = (componente) => {
    setModalType('editar')
    setCurrentComponente(componente)
    setFormData({
      nombre: componente.nombre,
      descripcion: componente.descripcion || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) return

    try {
      if (modalType === 'crear') {
        await crear(formData.nombre, formData.descripcion)
      } else {
        await editar(currentComponente.id, formData)
      }
      setShowModal(false)
      setFormData({ nombre: '', descripcion: '' })
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  const handleEliminar = async (componente) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el componente "${componente.nombre}"?`
      )
    ) {
      await eliminar(componente.id)
    }
  }

  if (loading)
    return <div className='p-6 text-gray-600'>Cargando componentes...</div>
  if (error)
    return <div className='p-6 text-red-600'>Error al cargar componentes</div>

  // Aseguramos que siempre sea un array
  const componentesArray = componentes?.componentes || componentes || []

  return (
    <div className='p-6 space-y-6'>
      {/* Título y botones */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Gestión de Componentes
        </h1>
        <div className='flex items-center gap-3'>
          <button
            onClick={openCrearModal}
            className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition'
          >
            <Plus className='w-5 h-5' /> Crear Componente
          </button>
          <button
            onClick={fetchComponentes}
            className='flex items-center gap-2 text-gray-700 hover:text-gray-900 transition'
          >
            <RefreshCw className='w-5 h-5' /> Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className='bg-white rounded-2xl p-4 shadow-sm border border-gray-300'>
        <table className='min-w-full border-separate border-spacing-0'>
          <thead>
            <tr className='bg-gray-50 text-left text-sm text-gray-600 uppercase'>
              <th className='p-3 border-b border-gray-300'>#</th>
              <th className='p-3 border-b border-gray-300'>Nombre</th>
              <th className='p-3 border-b border-gray-300 text-center'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {componentesArray.length === 0 ? (
              <tr>
                <td colSpan='5' className='text-center p-6 text-gray-500'>
                  No hay componentes registrados.
                </td>
              </tr>
            ) : (
              componentesArray.map((componente, index) => (
                <tr
                  key={componente.id || index}
                  className='text-gray-800 hover:bg-gray-100 transition border-b border-gray-200'
                >
                  <td className='p-3 text-sm'>{index + 1}</td>
                  <td className='p-3 font-medium'>{componente.nombre}</td>
                  <td className='p-3 flex justify-center gap-2'>
                    <button
                      onClick={() => openEditarModal(componente)}
                      className='text-blue-600 hover:text-blue-800 transition p-1'
                      title='Editar'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>

                    <button
                      onClick={() => handleEliminar(componente)}
                      className='text-red-600 hover:text-red-800 transition p-1'
                      title='Eliminar'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear/Editar */}
      {showModal && (
        <div className='fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>
              {modalType === 'crear' ? 'Crear Componente' : 'Editar Componente'}
            </h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nombre *
                </label>
                <input
                  type='text'
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Nombre del componente'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Descripción del componente'
                  rows='3'
                />
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 transition'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
                >
                  {modalType === 'crear' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
