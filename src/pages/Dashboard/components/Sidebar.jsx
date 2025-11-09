//src/pages/Dashboard/components/Sidebar.jsx
import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { usePrivilegios } from '../../../hooks/usePrivilegio'
import {
  Home,
  Settings,
  ListTree,
  Building,
  ChevronRight,
  Menu,
  User,
  LogOut,
  Tags,
  X,
  TrendingUp,
  Landmark
} from 'lucide-react'

// Menú base
const baseMenuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
  {
    id: 'permisos',
    icon: Settings,
    label: 'Permisos',
    subItems: [
      { id: 'grupos', label: 'Grupos', path: '/dashboard/permisos/grupos' },
      {
        id: 'privilegios',
        label: 'Privilegios',
        path: '/dashboard/permisos/privilegios'
      },
      {
        id: 'componentes',
        label: 'Modulos',
        path: '/dashboard/permisos/componentes'
      }
    ]
  },
  {
    id: 'categorias',
    icon: Tags,
    label: 'Categorias',
    path: '/dashboard/categorias'
  },
  {
    id: 'subcategorias',
    icon: ListTree,
    label: 'Subcategorias',
    path: '/dashboard/subcategorias'
  },
  {
    id: 'productos',
    icon: TrendingUp,
    label: 'Productos',
    path: '/dashboard/productos'
  },
  {
    id: 'marcas',
    icon: Landmark,
    label: 'Marcas',
    path: '/dashboard/marcas'
  }
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openSubMenu, setOpenSubMenu] = useState(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { privilegios, loading } = usePrivilegios()

  if (loading) {
    return <div className='p-4 text-gray-500'>Cargando menú...</div>
  }

  // Si el usuario es administrador, tiene acceso a todo
  const esAdmin = user?.grupo_nombre.toLowerCase() === 'administrador'
  // 🔍 Filtrar solo los componentes con al menos un privilegio TRUE
  const privilegiosActivos = esAdmin
    ? baseMenuItems.map((item) => item.id) // admin = todo
    : privilegios
        .filter(
          (p) =>
            p.puede_crear ||
            p.puede_actualizar ||
            p.puede_eliminar ||
            p.puede_leer ||
            p.puede_activar
        )
        .map((p) => p.componente.toLowerCase())

  // 🧩 Filtrar menú base según los privilegios
  const menuItems = baseMenuItems.filter((item) => {
    if (item.id === 'dashboard') return true // Dashboard siempre visible
    return privilegiosActivos.includes(item.id.toLowerCase())
  })
  //   const menuItems = baseMenuItems.filter((item) => {
  //   if (item.id === 'dashboard' || item.id === 'solicitud-inmueble') return true
  //   return privilegiosActivos.includes(item.id.toLowerCase())
  // })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getUserDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim()
    }
    return user?.username || 'Usuario'
  }

  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } flex flex-col`}
    >
      {/* Encabezado */}
      <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
        <div
          className={`flex items-center space-x-3 ${
            !sidebarOpen && 'justify-center'
          }`}
        >
          <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center'>
            <Building className='w-5 h-5 text-white' />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className='text-xl font-bold text-gray-900'>SmartSales</h1>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
        >
          {sidebarOpen ? (
            <X className='w-4 h-4' />
          ) : (
            <Menu className='w-4 h-4' />
          )}
        </button>
      </div>

      {/* Usuario */}
      <div className='p-4 border-b border-gray-100'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center'>
            <User className='w-5 h-5 text-white' />
          </div>
          {sidebarOpen && (
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {getUserDisplayName()}
              </p>
              <p className='text-xs text-gray-500 truncate'>
                {user?.grupo_nombre}
              </p>
              <p className='text-xs text-gray-400 truncate'>{user?.correo}</p>
            </div>
          )}
        </div>
      </div>

      {/* Menú dinámico */}
      <nav className='flex-1 p-4 space-y-2'>
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.subItems ? (
              <button
                onClick={() =>
                  setOpenSubMenu(openSubMenu === item.id ? null : item.id)
                }
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  openSubMenu === item.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                {sidebarOpen && (
                  <span className='font-medium'>{item.label}</span>
                )}
                {sidebarOpen && (
                  <ChevronRight
                    className={`w-4 h-4 ml-auto transition-transform ${
                      openSubMenu === item.id ? 'rotate-90' : ''
                    }`}
                  />
                )}
              </button>
            ) : (
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                {sidebarOpen && (
                  <span className='font-medium'>{item.label}</span>
                )}
              </NavLink>
            )}

            {/* Submenú */}
            {item.subItems && openSubMenu === item.id && sidebarOpen && (
              <div className='ml-8 mt-1 space-y-1'>
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.id}
                    to={sub.path}
                    className={({ isActive }) =>
                      `w-full block px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Cerrar sesión */}
      <div className='p-4 border-t border-gray-100'>
        <button
          className='w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all'
          onClick={handleLogout}
        >
          <LogOut className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
          {sidebarOpen && <span className='font-medium'>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  )
}
