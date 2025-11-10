// src/pages/HomeUser/components/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  LogIn,
  Search,
  Home
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { useCarrito } from '../../../contexts/CarritoContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { totalItems, carrito } = useCarrito()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const navLinks = [
    { name: 'Inicio', href: '/home', icon: Home },
    { name: 'Catálogo', href: '/home/catalogo' },
    { name: 'Ofertas', href: '/home/ofertas' },
    { name: 'Nuevos', href: '/home/nuevos' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/home/catalogo?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setIsOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  // Componente de botón de autenticación condicional
  const AuthButton = ({ isMobile = false }) => (
    <>
      {user ? (
        // 🟢 Usuario Logeado: Botón de Perfil y Cerrar Sesión
        <div className={isMobile ? 'space-y-2' : 'flex items-center space-x-2'}>
          <Link
            to='/perfil'
            onClick={() => setIsOpen(false)}
            className={`flex items-center ${
              isMobile ? 'justify-start w-full' : 'justify-center'
            } px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200`}
          >
            <User className='h-4 w-4 mr-2' />
            Mi Cuenta
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              isMobile ? 'justify-start w-full' : 'justify-center'
            } px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition duration-200`}
          >
            <LogOut className='h-4 w-4 mr-2' />
            Cerrar Sesión
          </button>
        </div>
      ) : (
        // 🔴 Usuario No Logeado: Botón para Iniciar Sesión
        <Link
          to='/login'
          onClick={() => setIsOpen(false)}
          className={`flex items-center ${
            isMobile ? 'justify-start w-full' : 'justify-center'
          } bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-200 ease-in-out`}
        >
          <LogIn className='h-4 w-4 mr-2' />
          Iniciar Sesión
        </Link>
      )}
    </>
  )

  return (
    <nav className='bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Sección Izquierda: Logo y Enlaces de Navegación (Escritorio) */}
          <div className='flex items-center space-x-8'>
            {/* Logo - más compacto */}
            <Link
              to='/'
              className='flex-shrink-0 text-xl font-bold text-blue-600 tracking-tight whitespace-nowrap'
            >
              SMART<span className='text-gray-900'>SALES</span>
            </Link>

            {/* Enlaces Principales (Escritorio) - más compactos */}
            <div className='hidden md:flex items-center space-x-1'>
              {navLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className='flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ease-in-out whitespace-nowrap'
                  >
                    {IconComponent && (
                      <IconComponent className='h-4 w-4 mr-1' />
                    )}
                    {link.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Sección Derecha: Búsqueda, Utilidades y Auth */}
          <div className='flex items-center space-x-3'>
            {/* Barra de Búsqueda (Escritorio) - más compacta */}
            <div className='hidden lg:block'>
              <form onSubmit={handleSearch} className='relative'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Buscar productos...'
                  className='pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-48 transition duration-150'
                />
                <Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              </form>
            </div>

            {/* Íconos de Utilidad (Carrito y Usuario) */}
            <div className='flex items-center space-x-2'>
              {/* 🛒 Botón de Carrito */}
              <Link
                to='/home/carrito'
                className='relative p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition duration-150'
                aria-label='Carrito de compras'
              >
                <ShoppingCart className='h-5 w-5' />

                {/* Contador de Items */}
                {totalItems > 0 && (
                  <span
                    className='absolute -top-1 -right-1 
                               inline-flex items-center justify-center 
                               h-5 w-5 text-xs font-bold leading-none text-white 
                               bg-red-500 rounded-full border-2 border-white'
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* 👤 Botón de Autenticación (Escritorio) */}
              <div className='hidden md:block'>
                <AuthButton />
              </div>
            </div>

            {/* Botón de Menú Móvil */}
            <div className='md:hidden'>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className='p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150'
                aria-expanded={isOpen}
              >
                <span className='sr-only'>Abrir menú principal</span>
                {isOpen ? (
                  <X className='block h-5 w-5' />
                ) : (
                  <Menu className='block h-5 w-5' />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {isOpen && (
        <div className='md:hidden border-t border-gray-100 bg-white absolute top-16 left-0 right-0 shadow-lg'>
          <div className='px-4 pt-2 pb-4 space-y-1'>
            {/* 🔗 Enlaces Móviles */}
            {navLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className='flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-3 rounded-lg text-base font-medium transition duration-200'
                >
                  {IconComponent && <IconComponent className='h-5 w-5 mr-3' />}
                  {link.name}
                </Link>
              )
            })}

            <div className='py-3 border-t border-gray-100 space-y-3'>
              {/* 🔍 Barra de Búsqueda (Móvil) */}
              <form onSubmit={handleSearch} className='relative'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Buscar productos...'
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition duration-150'
                />
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              </form>
            </div>

            {/* 🛒 Carrito Info (Móvil) */}
            {totalItems > 0 && (
              <div className='py-3 border-t border-gray-100'>
                <Link
                  to='/carrito'
                  onClick={() => setIsOpen(false)}
                  className='flex items-center justify-between text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg'
                >
                  <span className='flex items-center'>
                    <ShoppingCart className='h-5 w-5 mr-2' />
                    Mi Carrito
                  </span>
                  <span className='bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-bold'>
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </Link>
                <div className='px-3 text-sm text-gray-500 mt-1'>
                  Total: Bs {carrito?.total || 0}
                </div>
              </div>
            )}

            {/* 🔑 Botones de Autenticación (Móvil) */}
            <div className='pt-3 border-t border-gray-100'>
              <AuthButton isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
