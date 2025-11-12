import { useState, useEffect } from 'react'
import { Search, Edit, Trash2, Users, Filter } from 'lucide-react'
import { getUsers, deleteUser, updateUser } from '../../api/usuarios/usuarios'
import { useApi } from '../../hooks/useApi'
import ApprovalModal from '../../components/AprovalModal'
import ErrorModal from '../../components/ErrorModal'
import UserFormModal from './components/UserFormModal'

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: ''
  })
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' })

  // Hooks para las APIs
  const { execute: fetchUsers, loading: loadingUsers } = useApi(getUsers)
  const { execute: removeUser, loading: deletingUser } = useApi(deleteUser)
  const { execute: modifyUser, loading: updatingUser } = useApi(updateUser)

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [])

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      const response = await fetchUsers()
      if (response?.data) {
        setUsers(response.data)
      }
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message:
          'Error al cargar los usuarios: ' +
          (error.message || 'Error desconocido')
      })
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleDelete = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return

    try {
      await removeUser(selectedUser.id)
      setUsers(users.filter((user) => user.id !== selectedUser.id))
      setSuccessModal({
        isOpen: true,
        message: 'Usuario desactivado correctamente'
      })
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message:
          'Error al desactivar el usuario: ' +
          (error.message || 'Error desconocido')
      })
    } finally {
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
    }
  }

  const handleUpdateUser = async (userData) => {
    try {
      const response = await modifyUser(selectedUser.id, userData)
      if (response?.data?.status === 1) {
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, ...userData } : user
          )
        )
        setSuccessModal({
          isOpen: true,
          message: 'Usuario actualizado correctamente'
        })
        setIsEditModalOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message:
          'Error al actualizar el usuario: ' +
          (error.message || 'Error desconocido')
      })
    }
  }

  const getStatusBadge = (user) => {
    if (!user.is_active) {
      return (
        <span className='px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'>
          Inactivo
        </span>
      )
    }
    return (
      <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
        Activo
      </span>
    )
  }

  const getFullName = (user) => {
    return (
      `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre'
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
                <Users className='w-8 h-8 mr-3 text-blue-600' />
                Gestión de Usuarios
              </h1>
              <p className='text-gray-600 mt-2'>
                Administra los usuarios del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <Users className='w-8 h-8 text-blue-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Total Usuarios
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {users.length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <Filter className='w-8 h-8 text-green-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Activos</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {users.filter((u) => u.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <Filter className='w-8 h-8 text-red-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Inactivos</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {users.filter((u) => !u.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='bg-white rounded-lg shadow mb-6'>
          <div className='p-6 border-b'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1 relative'>
                <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Buscar por nombre, apellido, email, usuario o teléfono...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Usuario
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Teléfono
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Grupo
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Estado
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loadingUsers ? (
                  <tr>
                    <td colSpan='6' className='px-6 py-8 text-center'>
                      <div className='flex justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                      </div>
                      <p className='text-gray-500 mt-2'>Cargando usuarios...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan='6'
                      className='px-6 py-8 text-center text-gray-500'
                    >
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center'>
                            <span className='text-blue-600 font-medium'>
                              {getFullName(user).charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {getFullName(user)}
                            </div>
                            <div className='text-sm text-gray-500'>
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {user.email}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {user.telefono || 'N/A'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='text-sm text-gray-900 capitalize'>
                          {user.grupo_nombre || 'Sin grupo'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {getStatusBadge(user)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex justify-end space-x-2'>
                          <button
                            onClick={() => handleEdit(user)}
                            className='text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors'
                            title='Editar usuario'
                          >
                            <Edit className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deletingUser}
                            className='text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50'
                            title='Desactivar usuario'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApprovalModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <div className='flex items-center mb-4'>
              <Trash2 className='w-6 h-6 text-red-600 mr-2' />
              <h2 className='text-lg font-semibold'>Desactivar Usuario</h2>
            </div>
            <p className='text-gray-600 mb-6'>
              ¿Estás seguro de que deseas desactivar al usuario{' '}
              <strong>{getFullName(selectedUser)}</strong>? El usuario ya no
              podrá acceder al sistema.
            </p>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedUser(null)
                }}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingUser}
                className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
              >
                {deletingUser ? 'Desactivando...' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          onSubmit={handleUpdateUser}
          loading={updatingUser}
          mode='edit'
        />
      )}
    </div>
  )
}

export default UserManagementPage
