import { useEffect, useState } from 'react'

export const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  const dismissInstall = () => {
    setDeferredPrompt(null)
    setShowInstall(false)
  }

  if (!showInstall) return null

  return (
    <div className='fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='font-semibold'>📱 Instalar SmartSales</h3>
        <button
          onClick={dismissInstall}
          className='text-white hover:text-gray-200 ml-2'
        >
          ×
        </button>
      </div>
      <p className='text-sm mb-3'>Instala la app para una mejor experiencia</p>
      <div className='flex gap-2'>
        <button
          onClick={installApp}
          className='flex-1 bg-white text-blue-600 py-2 px-4 rounded font-medium hover:bg-gray-100 transition-colors'
        >
          Instalar
        </button>
        <button
          onClick={dismissInstall}
          className='flex-1 bg-transparent border border-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors'
        >
          Ahora no
        </button>
      </div>
    </div>
  )
}
