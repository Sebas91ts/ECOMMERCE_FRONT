// src/components/ErrorModal.jsx
import { XCircle, X } from 'lucide-react'

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-fade-in'>
        <div className='flex justify-between items-start mb-4'>
          <div className='flex items-center'>
            <XCircle className='text-red-500 w-6 h-6 mr-2' />
            <h2 className='text-lg font-semibold text-gray-800'>Error</h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <p className='text-gray-600 mb-6'>{message}</p>

        <div className='flex justify-end'>
          <button
            onClick={onClose}
            className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorModal
