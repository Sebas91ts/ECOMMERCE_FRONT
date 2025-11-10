import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import HomeUser from '../pages/HomeUser/HomeUser'
import HomePage from '../pages/HomeUser/ContentHomeUser'
import ProductCatalogPage from '../pages/Productos/ProductCatalogPage'

export default function UserRoutes() {
  return (
    <Routes>
      <Route path='/' element={<HomeUser />}>
        <Route index element={<HomePage />} />
        <Route path='catalogo' element={<ProductCatalogPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  )
}
