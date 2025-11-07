// src/pages/Permisos/Grupos.jsx
import { useState } from 'react'
import { PlusCircle, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { useGrupos } from '../../hooks/useGrupos'

export default function Grupos() {
  const { grupos, loading, error, crear, editar, eliminar, fetchGrupos } = useGrupos()
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')

  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return alert('El nombre es obligatorio')
    await crear(nuevoNombre, nuevaDescripcion)
    setNuevoNombre('')
    setNuevaDescripcion('')
  }

  const handleEditar = async (grupo) => {
    const nuevoNombre = prompt('Nuevo nombre:', grupo.nombre)
    const nuevaDescripcion = prompt('Nueva descripción:', grupo.descripcion || '')
    if (nuevoNombre !== null) {
      await editar(grupo.id, { nombre: nuevoNombre, descripcion: nuevaDescripcion })
    }
  }

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este grupo?')) {
      await eliminar(id)
    }
  }

  if (loading) return <div className="p-6 text-gray-600">Cargando grupos...</div>
  if (error) return <div className="p-6 text-red-600">Error al cargar grupos</div>

  return (
    <div className="p-6 space-y-6">
      {/* Título y botón crear */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Grupos</h1>
        <button
          onClick={handleCrear}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
        >
          <PlusCircle className="w-5 h-5" />
          Crear Grupo
        </button>
      </div>

      {/* Formulario nuevo grupo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-300">
        <h2 className="text-lg font-semibold mb-4">Nuevo Grupo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del grupo"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <input
            type="text"
            placeholder="Descripción"
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
            className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Listado de Grupos</h2>
          <button
            onClick={fetchGrupos}
            className="text-gray-700 hover:text-gray-900 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-600 uppercase">
              <th className="p-3 border-b border-gray-300">#</th>
              <th className="p-3 border-b border-gray-300">Nombre</th>
              <th className="p-3 border-b border-gray-300">Descripción</th>
              <th className="p-3 border-b border-gray-300 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(grupos || []).length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-500">
                  No hay grupos registrados.
                </td>
              </tr>
            ) : (
              (grupos || []).map((grupo, index) => (
                <tr
                  key={grupo.id || index}
                  className="text-gray-800 hover:bg-gray-100 transition border-b border-gray-200"
                >
                  <td className="p-3 text-sm">{index + 1}</td>
                  <td className="p-3 font-medium">{grupo.nombre}</td>
                  <td className="p-3">{grupo.descripcion || '-'}</td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleEditar(grupo)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEliminar(grupo.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
