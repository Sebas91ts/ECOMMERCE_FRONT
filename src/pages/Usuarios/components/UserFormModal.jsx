// src/components/UserFormModal.jsx
import { useState, useEffect } from 'react'
import { X, User, Mail, Key, Phone, MapPin } from 'lucide-react'

const UserFormModal = ({ user, onClose, onSubmit, loading, mode = 'edit' }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    telefono: '',
    grupo_nombre: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        telefono: user.telefono || '',
        grupo_nombre: user.grupo_nombre || '',
        password: '',
        confirmPassword: ''
      })
    }
  }, [user, mode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (mode === 'create' && formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    // Preparar datos para enviar (sin confirmPassword)
    const submitData = { ...formData }
    delete submitData.confirmPassword

    // Si es edición y no se cambió la contraseña, no enviarla
    if (mode === 'edit' && !submitData.password) {
      delete submitData.password
    }

    onSubmit(submitData)
  }

  return (
    <div className='fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold flex items-center'>
            <User className='w-5 h-5 mr-2' />
            {mode === 'edit' ? 'Editar Usuario' : 'Crear Usuario'}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Nombre */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nombre *
              </label>
              <div className='relative'>
                <User className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  name='first_name'
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Ingrese el nombre'
                />
              </div>
            </div>

            {/* Apellido */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Apellido *
              </label>
              <input
                type='text'
                name='last_name'
                value={formData.last_name}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Ingrese el apellido'
              />
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email *
              </label>
              <div className='relative'>
                <Mail className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='usuario@ejemplo.com'
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Usuario *
              </label>
              <input
                type='text'
                name='username'
                value={formData.username}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Ingrese el nombre de usuario'
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Teléfono
              </label>
              <div className='relative'>
                <Phone className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='tel'
                  name='telefono'
                  value={formData.telefono}
                  onChange={handleChange}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='+56 9 1234 5678'
                />
              </div>
            </div>

            {/* Grupo */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Grupo
              </label>
              <select
                name='grupo_nombre'
                value={formData.grupo_nombre}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Seleccionar grupo</option>
                <option value='cliente'>Cliente</option>
                <option value='administrador'>Administrador</option>
                <option value='vendedor'>Vendedor</option>
              </select>
            </div>

            {/* Contraseña (solo para crear o cambiar) */}
            {mode === 'create' ? (
              <>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Contraseña *
                  </label>
                  <div className='relative'>
                    <Key className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <input
                      type='password'
                      name='password'
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Ingrese la contraseña'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Confirmar Contraseña *
                  </label>
                  <div className='relative'>
                    <Key className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <input
                      type='password'
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Confirme la contraseña'
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nueva Contraseña (dejar en blanco para no cambiar)
                </label>
                <div className='relative'>
                  <Key className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                  <input
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Ingrese nueva contraseña'
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className='flex justify-end space-x-3 pt-4 border-t'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center'
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Actualizando...
                </>
              ) : (
                'Actualizar Usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserFormModal
