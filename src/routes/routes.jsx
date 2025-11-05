import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../pages/login'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRutes'

export default function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  // 👇 Si es admin, enviamos todo al router del dashboard (que ya maneja /dashboard/*)
  if (isAuthenticated && user?.grupo_nombre === 'administrador') {
    return <AdminRoutes />
  }

  // 👇 Público (cliente): montamos TODAS las rutas de UserRoutes en /*
  return (
    <Routes>
      {/* Layout del cliente */}
      <Route path='/home/*' element={<UserRoutes />} />
      <Route path='/login' element={<LoginForm />} />
      <Route path='*' element={<Navigate to='/home' />} />
    </Routes>
  )
}
