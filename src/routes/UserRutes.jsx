// UserRoutes.jsx
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import HomeUser from '../pages/HomeUser/HomeUser'
import HomePage from '../pages/HomeUser/ContentHomeUser'
import ProductCatalogPage from '../pages/Productos/ProductCatalogPage'
import CarritoPage from '../pages/HomeUser/CarritoPage'
import { CarritoProvider } from '../contexts/CarritoContext'

export default function UserRoutes() {
  return (
    <CarritoProvider>
      <Routes>
        <Route path='/' element={<HomeUser />}>
          <Route index element={<HomePage />} />
          <Route path='catalogo' element={<ProductCatalogPage />} />
          <Route path='carrito' element={<CarritoPage />} />{' '}
          {/* 👈 Agrega esta ruta */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
      </Routes>
    </CarritoProvider>
  )
}
