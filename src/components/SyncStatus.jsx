import { useState, useEffect } from 'react'
import { offlineSync } from '../utils/offlineSync'

export const SyncStatus = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [queueSize, setQueueSize] = useState(0)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    setQueueSize(offlineSync.queue.length)

    const handleQueueUpdate = (event) => {
      setQueueSize(event.detail.queueSize)
    }

    const handleSyncStart = () => setIsSyncing(true)

    const handleSyncComplete = (event) => {
      setIsSyncing(false)
      const { successCount, errorCount } = event.detail

      if (successCount > 0) {
        setNotification({
          message: `${successCount} operación(es) completada(s)${
            errorCount > 0 ? `, ${errorCount} error(es)` : ''
          }`,
          type: errorCount > 0 ? 'warning' : 'success'
        })

        setTimeout(() => setNotification(null), 3000)
      }
    }

    window.addEventListener('offline-queue-update', handleQueueUpdate)
    window.addEventListener('offline-sync', handleSyncStart)
    window.addEventListener('offline-sync-complete', handleSyncComplete)

    return () => {
      window.removeEventListener('offline-queue-update', handleQueueUpdate)
      window.removeEventListener('offline-sync', handleSyncStart)
      window.removeEventListener('offline-sync-complete', handleSyncComplete)
    }
  }, [])

  if (queueSize === 0 && !isSyncing && !notification) {
    return null
  }

  return (
    <>
      {/* Notificación de resultados - POSICIÓN CENTRAL */}
      {notification && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 text-sm min-w-[200px] text-center ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Indicador de estado actual - ESQUINA INFERIOR IZQUIERDA */}
      {isSyncing ? (
        <div className='fixed bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-sm z-40'>
          🔄 Sincronizando...
        </div>
      ) : queueSize > 0 ? (
        <div className='fixed bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded text-sm z-40'>
          ⚡ {queueSize} pendiente
        </div>
      ) : null}
    </>
  )
}
