import React, { useState } from 'react'

// 🚨 IMPORTACIONES NECESARIAS: Asegúrate de que las rutas sean correctas
import { useAuth } from '../../../hooks/useAuth'
import { ShoppingCart, User, Menu, X, LogOut, LogIn } from 'lucide-react'
// 🚨 FIN DE IMPORTACIONES

const Navbar = () => {
  // 💡 Uso del hook de autenticación
  // user: object si está logeado, null si no
  // logout: función para cerrar sesión
  const { user, logout } = useAuth()
  console.log(user)

  const [isOpen, setIsOpen] = useState(false)
  const cartItemCount = 3

  const navLinks = [
    { name: 'Lo Más Vendido', href: '/best-sellers' },
    { name: 'Ofertas Flash', href: '/deals' },
    { name: 'Nuevos', href: '/new-arrivals' }
  ]

  // Componente de botón de autenticación condicional
  const AuthButton = ({ isMobile = false }) => (
    <>
      {user ? (
        // 🟢 Usuario Logeado: Botón de Perfil y Cerrar Sesión
        <div className={isMobile ? 'space-y-1' : 'flex items-center space-x-2'}>
          <a
            href='/profile'
            className={`flex items-center ${
              isMobile ? 'justify-start' : 'justify-center'
            } px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition duration-200`}
          >
            <User className='h-5 w-5 mr-2' />
            Mi Cuenta
          </a>
          <button
            onClick={logout}
            className={`flex items-center ${
              isMobile ? 'justify-start' : 'justify-center'
            } px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition duration-200`}
          >
            <LogOut className='h-5 w-5 mr-2' />
            Cerrar Sesión
          </button>
        </div>
      ) : (
        // 🔴 Usuario No Logeado: Botón para Iniciar Sesión
        <a
          href='/login'
          className={`w-full flex items-center ${
            isMobile ? 'justify-start' : 'justify-center'
          } bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md`}
        >
          <LogIn className='h-5 w-5 mr-2' />
          Iniciar Sesión
        </a>
      )}
    </>
  )

  return (
    <nav className='bg-white shadow-xl sticky top-0 z-50 border-b border-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          {' '}
          {/* Aumentamos la altura a h-20 */}
          {/* Sección Izquierda: Logo y Enlaces de Navegación (Escritorio) */}
          <div className='flex items-center h-full'>
            {/* Logo */}
            <a
              href='/'
              className='flex-shrink-0 text-3xl font-extrabold text-indigo-600 tracking-tight'
            >
              SMART<span className='text-gray-900'>SALES</span>
            </a>

            {/* Enlaces Principales (Escritorio) */}
            <div className='hidden md:block ml-10 space-x-1'>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className='text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-2 rounded-lg text-base font-semibold transition duration-200 ease-in-out'
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          {/* Sección Derecha: Búsqueda, Utilidades y Auth */}
          <div className='flex items-center space-x-4'>
            {/* Barra de Búsqueda (Escritorio) */}
            <div className='hidden lg:block'>
              {' '}
              {/* Solo en pantallas grandes (lg) para más espacio */}
              <input
                type='text'
                placeholder='Buscar productos...'
                className='p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-56 transition duration-150'
              />
            </div>

            {/* Íconos de Utilidad (Carrito y Usuario) */}
            <div className='flex items-center space-x-2'>
              {/* 🛒 Botón de Carrito (Alineación corregida y Lucide Icon) */}
              <button
                className='relative p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition duration-150'
                aria-label='Carrito de compras'
              >
                <ShoppingCart className='h-6 w-6' />

                {/* Contador de Items (Clases de alineación corregidas) */}
                {cartItemCount > 0 && (
                  <span
                    className='absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 
                                       inline-flex items-center justify-center 
                                       h-5 w-5 text-xs font-bold leading-none text-white 
                                       bg-red-600 rounded-full border-2 border-white'
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* 👤 Botón de Autenticación (Escritorio) */}
              <div className='hidden md:block ml-2'>
                <AuthButton />
              </div>
            </div>

            {/* Botón de Menú Móvil */}
            <div className='md:hidden'>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className='p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150'
                aria-expanded={isOpen}
              >
                <span className='sr-only'>Abrir menú principal</span>
                {/* Ícono de hamburguesa o de cierre */}
                {isOpen ? (
                  <X className='block h-6 w-6' />
                ) : (
                  <Menu className='block h-6 w-6' />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {isOpen && (
        <div className='md:hidden border-t border-gray-100'>
          <div className='px-2 pt-4 pb-3 space-y-2 sm:px-3'>
            {/* 🔗 Enlaces Móviles */}
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className='block text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-2 rounded-lg text-base font-medium transition duration-200'
              >
                {link.name}
              </a>
            ))}

            <div className='py-2 border-t border-gray-100 space-y-2'>
              {/* 🔍 Barra de Búsqueda (Móvil) */}
              <input
                type='text'
                placeholder='Buscar productos...'
                className='p-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150'
              />
            </div>

            {/* 🔑 Botones de Autenticación (Móvil) */}
            <div className='pt-2 border-t border-gray-100'>
              <AuthButton isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
