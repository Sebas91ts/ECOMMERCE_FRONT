import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoutes'
import Dashboard from '../pages/Dashboard/Dashboard'
import EditarPerfil from '../pages/Dashboard/components/EditarPerfil'
import Grupos from '../pages/Permisos/Grupos'
import Privilegios from '../pages/Permisos/Privilegios'
import Componentes from '../pages/Permisos/Componentes'

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
        {/* PERMISOS Y PRIVILEGIOS  */}
        <Route path='permisos/grupos' element={<Grupos />} />
        <Route path='permisos/privilegios' element={<Privilegios />} />
        <Route path='permisos/componentes' element={<Componentes />} />
      </Route>
      {/* Redirección para cualquier otra ruta */}
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  )
}
