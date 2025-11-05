import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// HOC para proteger rutas
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      // Redireccionar al login o mostrar componente de login
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
