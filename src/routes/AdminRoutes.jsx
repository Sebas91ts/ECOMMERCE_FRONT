import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoutes'
import Dashboard from '../pages/Dashboard/Dashboard'
import EditarPerfil from '../pages/Dashboard/components/EditarPerfil'
import Grupos from '../pages/Permisos/Grupos'
import Privilegios from '../pages/Permisos/Privilegios'
import Componentes from '../pages/Permisos/Componentes'
import CategoryManager from '../pages/Categorias/CategoryManager'
import SubcategoryManager from '../pages/Categorias/SubcategoryManager'
import ProductManager from '../pages/Productos/ProductManager'
import MarcaManager from '../pages/Marcas/MarcaManager'
import UserManagementPage from '../pages/Usuarios/UserManagementPage'
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
        {/* CATEGORIAS */}
        <Route path='categorias' element={<CategoryManager />} />
        <Route path='subcategorias' element={<SubcategoryManager />} />
        {/* PRODUCTOS */}
        <Route path='productos' element={<ProductManager />} />
        {/* MARCAS */}
        <Route path='marcas' element={<MarcaManager />} />
        {/* USUARIOS */}
        <Route path='usuarios' element={<UserManagementPage />} />
      </Route>
      {/* Redirección para cualquier otra ruta */}
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  )
}
