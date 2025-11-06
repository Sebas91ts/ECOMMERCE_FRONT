import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import HomeUser from '../pages/HomeUser/HomeUser'
import Home from '../pages/HomeUser/ContentHomeUser'

export default function UserRoutes() {
  return (
    <Routes>
      <Route path='/' element={<HomeUser />}>
        Página por defecto
        <Route index element={<Home />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Route>
    </Routes>
  )
}
