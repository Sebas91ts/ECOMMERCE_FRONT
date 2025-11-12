import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, ShoppingBag, ArrowRight } from 'lucide-react'

const PedidoPendientePage = () => {
  const { pedidoId } = useParams()

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='container mx-auto px-4'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='bg-white rounded-lg shadow-sm border p-8'>
            {/* Icono de pendiente */}
            <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Clock className='w-8 h-8 text-yellow-600' />
            </div>

            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
              Pedido en Proceso
            </h1>

            <p className='text-gray-600 mb-2'>
              Tu pedido <strong>#{pedidoId}</strong> está siendo procesado
            </p>

            <p className='text-gray-500 text-sm mb-8'>
              Te notificaremos cuando tu pedido sea confirmado. Esto puede tomar
              hasta 24 horas.
            </p>

            {/* Información del pedido */}
            <div className='bg-yellow-50 rounded-lg p-6 mb-8 text-left border border-yellow-200'>
              <h3 className='font-semibold text-gray-900 mb-4 flex items-center'>
                <ShoppingBag className='w-5 h-5 mr-2 text-yellow-600' />
                Estado del Pedido
              </h3>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Número de pedido:</span>
                  <span className='font-medium'>#{pedidoId}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Estado:</span>
                  <span className='text-yellow-600 font-medium'>
                    Pendiente de Confirmación
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Fecha:</span>
                  <span className='font-medium'>
                    {new Date().toLocaleDateString('es-BO')}
                  </span>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className='bg-blue-50 rounded-lg p-4 mb-6 text-left'>
              <h4 className='font-semibold text-blue-800 mb-2'>
                Próximos pasos:
              </h4>
              <ul className='text-sm text-blue-700 space-y-1'>
                <li>• Revisaremos tu solicitud de crédito</li>
                <li>• Te contactaremos para confirmar detalles</li>
                <li>• Recibirás una notificación por correo</li>
              </ul>
            </div>

            {/* Acciones */}
            <div className='space-y-4'>
              <Link
                to='/catalogo'
                className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center'
              >
                Seguir Comprando
                <ArrowRight className='w-4 h-4 ml-2' />
              </Link>

              <Link
                to='/mis-pedidos'
                className='text-blue-600 hover:text-blue-700 text-sm font-medium inline-block'
              >
                Ver estado de mis pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PedidoPendientePage
