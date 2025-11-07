import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Phone } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    email: '',
    telefono: ''
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const { login, register, loading, user } = useAuth() // ← Añade user aquí
  const navigate = useNavigate()
  const location = useLocation()

  // Determinar la ruta por defecto basada en el usuario actual (si existe)
  const getDefaultRedirect = () => {
    if (user?.grupo_nombre === 'administrador') {
      return '/dashboard'
    }
    return '/home'
  }

  const from = location.state?.from?.pathname || getDefaultRedirect()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (apiError) {
      setApiError('')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) newErrors.username = 'Username requerido'
    if (!formData.password.trim()) newErrors.password = 'Contraseña requerida'

    if (!isLogin) {
      if (!formData.first_name.trim()) newErrors.first_name = 'Nombre requerido'
      if (!formData.last_name.trim()) newErrors.last_name = 'Apellido requerido'
      if (!formData.email.trim()) newErrors.email = 'Email requerido'
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = 'Email inválido'
      if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono requerido'
      if (!formData.password2.trim())
        newErrors.password2 = 'Confirmar contraseña'
      if (formData.password !== formData.password2)
        newErrors.password2 = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const parseApiError = (error) => {
    if (typeof error === 'string') return error

    if (error && typeof error === 'object') {
      // Si viene con estructura de Django
      if (error.errors) {
        const messages = []
        for (const [field, fieldErrors] of Object.entries(error.errors)) {
          if (Array.isArray(fieldErrors)) {
            messages.push(
              ...fieldErrors.map((err) => {
                const fieldName = field.replace(/_/g, ' ')
                return `${
                  fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
                }: ${err}`
              })
            )
          } else if (typeof fieldErrors === 'string') {
            messages.push(fieldErrors)
          }
        }
        return messages.join(' • ')
      }

      if (error.message) return error.message
      if (error.detail) return error.detail
    }

    return 'Error desconocido'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Resetear errores
    setApiError('')
    setErrors({})

    // Validar formulario
    if (!validateForm()) {
      return
    }

    const payload = isLogin
      ? { username: formData.username, password: formData.password }
      : {
          username: formData.username,
          password: formData.password,
          password2: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          telefono: formData.telefono
        }

    try {
      const result = isLogin ? await login(payload) : await register(payload)

      if (result.success) {
        // NO navegues aquí - AppRoutes detectará el cambio de estado y redirigirá
      } else {
        console.log('❌ Error del servidor:', result.error)
        const errorMessage = parseApiError(result.error)
        setApiError(errorMessage)
      }
    } catch (error) {
      setApiError('Error de conexión')
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setApiError('')
    setFormData({
      username: '',
      password: '',
      password2: '',
      first_name: '',
      last_name: '',
      email: '',
      telefono: ''
    })
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4'>
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg'>
            <Lock className='text-white' size={28} />
          </div>
          <h2 className='text-2xl font-bold text-gray-800'>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className='text-gray-600 mt-2'>
            {isLogin ? 'Bienvenido de vuelta' : 'Únete a nosotros'}
          </p>
        </div>

        {/* ERROR GLOBAL - Esta es la parte importante */}
        {apiError && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse'>
            <div className='flex items-start space-x-2'>
              <AlertCircle
                className='text-red-500 flex-shrink-0 mt-0.5'
                size={20}
              />
              <div className='flex-1'>
                <span className='text-red-700 text-sm font-medium block mb-1'>
                  {isLogin ? 'Error al iniciar sesión' : 'Error en el registro'}
                </span>
                <p className='text-red-600 text-sm'>{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resto del formulario igual... */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* ... todo el resto del código del formulario igual ... */}
          {!isLogin && (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nombre
                </label>
                <div className='relative'>
                  <User
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <input
                    type='text'
                    name='first_name'
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.first_name
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder='Juan'
                  />
                </div>
                {errors.first_name && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Apellido
                </label>
                <div className='relative'>
                  <User
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <input
                    type='text'
                    name='last_name'
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.last_name
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder='Pérez'
                  />
                </div>
                {errors.last_name && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.last_name}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Correo electrónico
                </label>
                <div className='relative'>
                  <Mail
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.email
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder='ejemplo@mail.com'
                  />
                </div>
                {errors.email && (
                  <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Teléfono
                </label>
                <div className='relative'>
                  <Phone
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <input
                    type='text'
                    name='telefono'
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.telefono
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder='123456789'
                  />
                </div>
                {errors.telefono && (
                  <p className='text-red-500 text-sm mt-1'>{errors.telefono}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Nombre de usuario
            </label>
            <div className='relative'>
              <User
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={20}
              />
              <input
                type='text'
                name='username'
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.username
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder='username'
              />
            </div>
            {errors.username && (
              <p className='text-red-500 text-sm mt-1'>{errors.username}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Contraseña
            </label>
            <div className='relative'>
              <Lock
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={20}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed'
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Confirmar Contraseña
              </label>
              <div className='relative'>
                <Lock
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password2'
                  value={formData.password2}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.password2
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder='••••••••'
                />
              </div>
              {errors.password2 && (
                <p className='text-red-500 text-sm mt-1'>{errors.password2}</p>
              )}
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
          >
            {loading ? (
              <div className='flex items-center justify-center space-x-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>{isLogin ? 'Iniciando...' : 'Registrando...'}</span>
              </div>
            ) : isLogin ? (
              'Iniciar Sesión'
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              type='button'
              onClick={toggleMode}
              disabled={loading}
              className='ml-2 text-indigo-600 hover:text-indigo-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
