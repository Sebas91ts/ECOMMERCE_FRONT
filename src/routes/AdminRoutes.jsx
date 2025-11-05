import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoutes'
import PrivilegedRoute from '../components/PrivilegedRoute'
export default function AdminRoutes() {
  return (
    <Routes>
      {/* Dashboard administrativo */}
      {/* <Route
        path='/dashboard'
        element={
          <ProtectedRoute requiredRole='Administrador'>
            <Dashboard />
          </ProtectedRoute>
        }
      > */}
      {/* <Route path='*' element={<Navigate to='/dashboard' />} />
      </Route> */}
    </Routes>
  )
}
