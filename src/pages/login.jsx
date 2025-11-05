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

  const { login, register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (error) clearError()
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim())
      newErrors.username = 'El username es requerido'

    if (!formData.password.trim())
      newErrors.password = 'La contraseña es requerida'
    else if (!isLogin && formData.password.length < 8)
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'

    if (!isLogin) {
      if (!formData.first_name.trim()) newErrors.first_name = 'Nombre requerido'
      if (!formData.last_name.trim()) newErrors.last_name = 'Apellido requerido'
      if (!formData.email.trim()) newErrors.email = 'Correo requerido'
      if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono requerido'
      if (!formData.password2.trim())
        newErrors.password2 = 'Confirmar contraseña'
      if (formData.password !== formData.password2)
        newErrors.password2 = 'No coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

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

    const result = isLogin ? await login(payload) : await register(payload)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      // Mostrar errores cortos y legibles
      if (typeof result.error === 'object') {
        const messages = Object.values(result.error)
          .flat()
          .map((e) => (e?.message ? e.message : e))
        setErrors({ global: messages.join(' • ') })
      } else {
        setErrors({ global: result.error })
      }
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setFormData({
      username: '',
      password: '',
      password2: '',
      first_name: '',
      last_name: '',
      email: '',
      telefono: ''
    })
    if (error) clearError()
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

        {/* Error global */}
        {errors.global && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2'>
            <AlertCircle className='text-red-500 flex-shrink-0' size={20} />
            <span className='text-red-700 text-sm'>{errors.global}</span>
          </div>
        )}

        {/* Form */}
        <div className='space-y-6'>
          {!isLogin && (
            <>
              {/* Nombre */}
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

              {/* Apellido */}
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

              {/* Email */}
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

              {/* Teléfono */}
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

          {/* Username */}
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

          {/* Contraseña */}
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

          {/* Confirmar contraseña (solo registro) */}
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

          {/* Botón */}
          <button
            onClick={handleSubmit}
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
        </div>

        {/* Toggle login/registro */}
        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
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
