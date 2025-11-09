import { useNetworkStatus } from '../hooks/useNetworkStatus'

export const NetworkStatus = () => {
  const { isOnline, wasOffline } = useNetworkStatus()

  if (isOnline && wasOffline) {
    return (
      <div className='fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out'>
        ✅ Conexión restaurada
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className='fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
        🔴 Modo offline
      </div>
    )
  }

  return null
}
