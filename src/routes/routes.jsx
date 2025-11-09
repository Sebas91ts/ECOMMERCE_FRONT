import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../pages/login'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRutes'
import { PWAInstaller } from '../components/PwaInstaller'
import { NetworkStatus } from '../components/NetWorkStatus'
import { useEffect, useState } from 'react'
import { SyncStatus } from '../components/SyncStatus'

export default function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  // Mostrar página offline si no hay conexión y no está autenticado
  if (!isOnline && !isAuthenticated) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='text-center p-8 bg-white rounded-lg shadow-lg'>
          <div className='text-6xl mb-4'>📡</div>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>
            Sin conexión
          </h1>
          <p className='text-gray-600 mb-4'>
            No hay conexión a internet en este momento.
          </p>
          <button
            onClick={() => window.location.reload()}
            className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600'
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    // 👇 Si está autenticado y es admin
    if (isAuthenticated && user?.grupo_nombre === 'administrador') {
      return <AdminRoutes />
    }

    // 👇 Si está autenticado pero NO es admin (usuario normal)
    if (isAuthenticated && user?.grupo_nombre !== 'administrador') {
      return (
        <Routes>
          <Route path='/home/*' element={<UserRoutes />} />
          <Route path='*' element={<Navigate to='/home' replace />} />
        </Routes>
      )
    }

    // 👇 NO autenticado - rutas públicas
    return (
      <Routes>
        <Route path='/login' element={<LoginForm />} />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    )
  }

  return (
    <>
      {renderContent()}
      <PWAInstaller />
      <NetworkStatus />
      <SyncStatus />
    </>
  )
}
