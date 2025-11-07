// src/pages/Permisos/Privilegios.jsx
import { useState } from 'react'
import { usePrivilegios } from '../../hooks/usePrivilegio2'
import { useGrupos } from '../../hooks/useGrupos'
import { useComponentes } from '../../hooks/useComponentes'
import CreatePrivilegeModal from './components/CreatePrivilegeModal'
import { Trash } from 'lucide-react'

export default function Privilegios() {
  const { privilegios, loading, error, editar, eliminar, asignar } =
    usePrivilegios()
  const { grupos } = useGrupos()
  const { componentes, loading: loadingComponentes } = useComponentes()
  const [abiertos, setAbiertos] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const componentesArray = componentes?.componentes || componentes || []

  if (loading)
    return <div className='p-6 text-gray-600'>Cargando privilegios...</div>
  if (error)
    return <div className='p-6 text-red-600'>Error al cargar privilegios</div>

  const privilegiosPorGrupo = privilegios.reduce((acc, p) => {
    const grupoNombre = p.grupo.nombre
    if (!acc[grupoNombre]) acc[grupoNombre] = []
    acc[grupoNombre].push(p)
    return acc
  }, {})

  const toggleGrupo = (grupo) =>
    setAbiertos((prev) => ({ ...prev, [grupo]: !prev[grupo] }))

  const handleToggle = async (priv, campo) => {
    const permisosActualizados = {
      puede_leer: priv.puede_leer,
      puede_crear: priv.puede_crear,
      puede_actualizar: priv.puede_actualizar,
      puede_eliminar: priv.puede_eliminar,
      [campo]: !priv[campo]
    }
    await editar(priv.id, permisosActualizados)
  }

  const handleEliminar = async (id) => {
    if (confirm('¿Seguro que querés eliminar este privilegio?')) {
      await eliminar(id)
    }
  }

  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold text-gray-900 mb-4'>
        Gestión de Privilegios
      </h1>

      <button
        onClick={() => setModalOpen(true)}
        className='mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        disabled={loadingComponentes} // Evita abrir el modal antes de cargar componentes
      >
        {loadingComponentes ? 'Cargando...' : 'Crear Privilegio'}
      </button>

      {Object.keys(privilegiosPorGrupo).map((grupo) => (
        <div
          key={grupo}
          className='border border-gray-200 rounded-2xl overflow-hidden shadow-sm'
        >
          <div
            className='bg-gray-50 p-4 cursor-pointer flex justify-between items-center'
            onClick={() => toggleGrupo(grupo)}
          >
            <span className='font-bold text-gray-800'>{grupo}</span>
            <span className='text-xl font-bold'>
              {abiertos[grupo] ? '−' : '+'}
            </span>
          </div>

          {abiertos[grupo] && (
            <div className='overflow-x-auto'>
              <table className='min-w-full border-collapse'>
                <thead>
                  <tr className='bg-gray-100 text-left text-sm text-gray-600 uppercase'>
                    <th className='p-3 border-b border-gray-200'>#</th>
                    <th className='p-3 border-b border-gray-200'>Componente</th>
                    <th className='p-3 border-b border-gray-200 text-center'>
                      Leer
                    </th>
                    <th className='p-3 border-b border-gray-200 text-center'>
                      Crear
                    </th>
                    <th className='p-3 border-b border-gray-200 text-center'>
                      Actualizar
                    </th>
                    <th className='p-3 border-b border-gray-200 text-center'>
                      Eliminar
                    </th>
                    <th className='p-3 border-b border-gray-200 text-center'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {privilegiosPorGrupo[grupo]
                    .filter(
                      (p) =>
                        !(
                          grupo === 'Administrador' &&
                          ['Grupo', 'Componente', 'Privilegio'].includes(
                            p.componente.nombre
                          )
                        )
                    )
                    .map((p, index) => (
                      <tr
                        key={p.id}
                        className='text-gray-800 hover:bg-gray-50 transition'
                      >
                        <td className='p-3 text-sm'>{index + 1}</td>
                        <td className='p-3 font-medium text-sm'>
                          {p.componente.nombre}
                        </td>
                        <td className='p-3 text-center'>
                          <input
                            type='checkbox'
                            checked={p.puede_leer}
                            onChange={() => handleToggle(p, 'puede_leer')}
                            className='accent-green-500 w-5 h-5 cursor-pointer'
                          />
                        </td>
                        <td className='p-3 text-center'>
                          <input
                            type='checkbox'
                            checked={p.puede_crear}
                            onChange={() => handleToggle(p, 'puede_crear')}
                            className='accent-green-500 w-5 h-5 cursor-pointer'
                          />
                        </td>
                        <td className='p-3 text-center'>
                          <input
                            type='checkbox'
                            checked={p.puede_actualizar}
                            onChange={() => handleToggle(p, 'puede_actualizar')}
                            className='accent-green-500 w-5 h-5 cursor-pointer'
                          />
                        </td>
                        <td className='p-3 text-center'>
                          <input
                            type='checkbox'
                            checked={p.puede_eliminar}
                            onChange={() => handleToggle(p, 'puede_eliminar')}
                            className='accent-green-500 w-5 h-5 cursor-pointer'
                          />
                        </td>
                        <td className='p-3 text-center'>
                          <button
                            onClick={() => handleEliminar(p.id)}
                            className='text-red-600 hover:text-red-800'
                          >
                            <Trash className='w-5 h-5 mx-auto' />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <CreatePrivilegeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        grupos={grupos}
        componentes={componentesArray}
        onCreate={asignar}
      />
    </div>
  )
}
