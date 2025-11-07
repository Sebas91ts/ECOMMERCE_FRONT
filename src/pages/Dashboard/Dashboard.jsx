import { Bell } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { useAuth } from '../../hooks/useAuth'
import UserAvatar from './components/UserAvatar'

export default function CondominioSmartDashboard() {
  // Datos simulados para el dashboard
  const { user } = useAuth()
  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Dashboard General
              </h1>
              <p className='text-gray-600 mt-1'>
                Gestión integral del condominio inteligente
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl'>
                <Bell className='w-5 h-5' />
                <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
              </button>
              <UserAvatar user={user} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
