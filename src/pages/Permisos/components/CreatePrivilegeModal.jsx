import { useState, useEffect } from 'react'
import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

const CreatePrivilegeModal = ({
  isOpen,
  onClose,
  grupos,
  componentes,
  onCreate
}) => {
  const [grupoId, setGrupoId] = useState('')
  const [componenteId, setComponenteId] = useState('')
  const [puedeLeer, setPuedeLeer] = useState(true)
  const [puedeCrear, setPuedeCrear] = useState(false)
  const [puedeActualizar, setPuedeActualizar] = useState(false)
  const [puedeEliminar, setPuedeEliminar] = useState(false)

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [gruposArray, setGruposArray] = useState([])
  const [componentesArray, setComponentesArray] = useState([])

  useEffect(() => {
    setGruposArray(Array.isArray(grupos) ? grupos : [])
  }, [grupos])

  useEffect(() => {
    if (Array.isArray(componentes)) {
      setComponentesArray(componentes)
    } else if (componentes?.componentes) {
      setComponentesArray(componentes.componentes)
    } else {
      setComponentesArray([])
    }
  }, [componentes])

  const handleSubmit = async () => {
    if (!grupoId || !componenteId) {
      setErrorMessage('Debes seleccionar grupo y componente')
      return
    }

    setLoading(true)
    try {
      await onCreate(grupoId, componenteId, {
        puede_leer: puedeLeer,
        puede_crear: puedeCrear,
        puede_actualizar: puedeActualizar,
        puede_eliminar: puedeEliminar
      })
      setSuccessMessage('Privilegio creado correctamente')

      // Limpia el formulario
      setGrupoId('')
      setComponenteId('')
      setPuedeLeer(true)
      setPuedeCrear(false)
      setPuedeActualizar(false)
      setPuedeEliminar(false)
    } catch (err) {
      setErrorMessage(
        'Error al crear privilegio: ' + (err.message || 'Error desconocido')
      )
    } finally {
      setLoading(false)
    }
  }

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null

  return (
    <>
      {/* Modal de creación de privilegio */}
      <div className='fixed inset-0 bg-black/20 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>
              Crear Privilegio
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Grupo
              </label>
              <select
                value={grupoId}
                onChange={(e) => setGrupoId(e.target.value)}
                className='mt-1 block w-full border border-gray-300 rounded-lg p-2'
                disabled={loading}
              >
                <option value=''>Seleccionar grupo</option>
                {gruposArray.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Componente
              </label>
              <select
                value={componenteId}
                onChange={(e) => setComponenteId(e.target.value)}
                className='mt-1 block w-full border border-gray-300 rounded-lg p-2'
                disabled={componentesArray.length === 0 || loading}
              >
                {componentesArray.length === 0 ? (
                  <option>Cargando componentes...</option>
                ) : (
                  <>
                    <option value=''>Seleccionar componente</option>
                    {componentesArray.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className='flex gap-4 flex-wrap'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={puedeLeer}
                  onChange={() => setPuedeLeer(!puedeLeer)}
                  className='accent-green-500'
                  disabled={loading}
                />
                Leer
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={puedeCrear}
                  onChange={() => setPuedeCrear(!puedeCrear)}
                  className='accent-green-500'
                  disabled={loading}
                />
                Crear
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={puedeActualizar}
                  onChange={() => setPuedeActualizar(!puedeActualizar)}
                  className='accent-green-500'
                  disabled={loading}
                />
                Actualizar
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={puedeEliminar}
                  onChange={() => setPuedeEliminar(!puedeEliminar)}
                  className='accent-green-500'
                  disabled={loading}
                />
                Eliminar
              </label>
            </div>

            <div className='flex justify-end gap-2'>
              <button
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400'
                disabled={
                  loading ||
                  componentesArray.length === 0 ||
                  !grupoId ||
                  !componenteId
                }
              >
                {loading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales de mensaje - SEPARADOS del modal principal */}
      {successMessage && (
        <ApprovalModal
          isOpen={!!successMessage}
          onClose={() => {
            setSuccessMessage('')
            onClose() // Cierra el modal de creación también
          }}
          message={successMessage}
        />
      )}

      {errorMessage && (
        <ErrorModal
          isOpen={!!errorMessage}
          onClose={() => setErrorMessage('')}
          message={errorMessage}
        />
      )}
    </>
  )
}

export default CreatePrivilegeModal
