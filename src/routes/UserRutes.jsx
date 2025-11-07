import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import HomeUser from '../pages/HomeUser/HomeUser'
import HomePage from '../pages/HomeUser/ContentHomeUser'

export default function UserRoutes() {
  return (
    <Routes>
      <Route path='/' element={<HomeUser />}>
        <Route index element={<HomePage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  )
}
