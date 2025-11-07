// src/pages/perfil/EditarPerfil.jsx
import { useState, useEffect } from 'react'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../../hooks/useApi'
import { updateProfile } from '../../../api/usuarios/usuarios'
import { useAuth } from '../../../hooks/useAuth'

export default function EditarPerfil() {
  const { user, updateUser } = useAuth()
  const { loading, error: apiError, execute } = useApi(updateProfile)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefono: '',
    ci: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Inicializar formData con los datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        telefono: user.telefono || '',
        ci: user.ci || '',
        password: ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido'
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    // Preparar datos para enviar
    const dataToSend = { ...formData }

    // Si la contraseña está vacía, eliminarla del envío
    if (!dataToSend.password.trim()) {
      delete dataToSend.password
    }

    const result = await execute(dataToSend)

    if (result?.data?.status === 1) {
      // Actualizar el contexto de autenticación con los nuevos datos
      updateUser({ ...user, ...result.data.values })
      setSuccessMessage('Perfil actualizado correctamente')

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } else {
      // Manejar errores del backend
      const backendErrors = result?.error?.errors || {}
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors)
      } else {
        setErrors({
          global: result?.error?.message || 'Error al actualizar el perfil'
        })
      }
    }
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='animate-spin w-6 h-6' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
          >
            <ArrowLeft className='w-5 h-5 mr-2' />
            Volver
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>Editar Perfil</h1>
          <p className='text-gray-600 mt-2'>
            Actualiza tu información personal
          </p>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-center'>
              <span className='text-green-800 text-sm'>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error global */}
        {errors.global && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center'>
              <span className='text-red-800 text-sm'>{errors.global}</span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className='bg-white shadow-sm rounded-lg p-6 space-y-6'
        >
          {/* Nombre y Apellido */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Nombre *
              </label>
              <input
                type='text'
                name='first_name'
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.first_name
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                required
              />
              {errors.first_name && (
                <p className='text-red-500 text-sm mt-1'>{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Apellido *
              </label>
              <input
                type='text'
                name='last_name'
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.last_name
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                required
              />
              {errors.last_name && (
                <p className='text-red-500 text-sm mt-1'>{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email y Teléfono */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Correo electrónico *
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Teléfono
              </label>
              <input
                type='text'
                name='telefono'
                value={formData.telefono}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='123456789'
              />
            </div>
          </div>

          {/* CI y Contraseña */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Cédula de Identidad
              </label>
              <input
                type='text'
                name='ci'
                value={formData.ci}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='1234567'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Cambiar Contraseña
              </label>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder='Dejar vacío para no cambiar'
              />
              {errors.password && (
                <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={() => navigate(-1)}
              className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors'
            >
              {loading && <Loader2 className='w-4 h-4 animate-spin' />}
              <span>{loading ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
