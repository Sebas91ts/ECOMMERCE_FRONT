// UserRoutes.jsx
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { CarritoProvider } from '../contexts/CarritoContext'
import HomeUser from '../pages/HomeUser/HomeUser'
import HomePage from '../pages/HomeUser/ContentHomeUser'
import ProductCatalogPage from '../pages/Productos/ProductCatalogPage'
import CarritoPage from '../pages/HomeUser/CarritoPage'
import CheckoutPage from '../pages/CompraUsuario/CheckoutPage'
import PedidoExitosoPage from '../pages/CompraUsuario/PedidoExitosoPage'
import PedidoPendientePage from '../pages/CompraUsuario/PedidoPendientePage'

export default function UserRoutes() {
  return (
    <CarritoProvider>
      <Routes>
        <Route path='/' element={<HomeUser />}>
          <Route index element={<HomePage />} />
          <Route path='catalogo' element={<ProductCatalogPage />} />
          <Route path='carrito' element={<CarritoPage />} />
          <Route path='checkout' element={<CheckoutPage />} />
          <Route
            path='pedido-exitoso/:pedidoId'
            element={<PedidoExitosoPage />}
          />
          <Route
            path='pedido-pendiente/:pedidoId'
            element={<PedidoPendientePage />}
          />
          {/* 👈 Agrega esta ruta */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
      </Routes>
    </CarritoProvider>
  )
}
