import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../pages/login'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRutes'

export default function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth()

  console.log('🔍 AppRoutes - Estado:', {
    isAuthenticated,
    loading,
    user: user?.grupo_nombre
  })

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  // 👇 Si está autenticado y es admin
  if (isAuthenticated && user?.grupo_nombre === 'administrador') {
    console.log('✅ Redirigiendo a AdminRoutes')
    return <AdminRoutes />
  }

  // 👇 Si está autenticado pero NO es admin (usuario normal)
  if (isAuthenticated && user?.grupo_nombre !== 'administrador') {
    console.log('✅ Redirigiendo a UserRoutes')
    return (
      <Routes>
        <Route path='/home/*' element={<UserRoutes />} />
        <Route path='*' element={<Navigate to='/home' replace />} />
      </Routes>
    )
  }

  // 👇 NO autenticado - rutas públicas
  console.log('🔐 Usuario no autenticado, mostrando login')
  return (
    <Routes>
      <Route path='/login' element={<LoginForm />} />
      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  )
}
