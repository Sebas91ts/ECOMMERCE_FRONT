import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoutes'
import Dashboard from '../pages/Dashboard/Dashboard'
import EditarPerfil from '../pages/Dashboard/components/EditarPerfil'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute requiredRole='Administrador'>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route path='editar-perfil' element={<EditarPerfil />} />
      </Route>
      {/* Redirección para cualquier otra ruta */}
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  )
}
