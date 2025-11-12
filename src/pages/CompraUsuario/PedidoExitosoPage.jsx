import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, ShoppingBag, Download, ArrowRight } from 'lucide-react'

const PedidoExitosoPage = () => {
  const { pedidoId } = useParams()

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='container mx-auto px-4'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='bg-white rounded-lg shadow-sm border p-8'>
            {/* Icono de éxito */}
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <CheckCircle className='w-8 h-8 text-green-600' />
            </div>

            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
              ¡Pedido Confirmado!
            </h1>

            <p className='text-gray-600 mb-2'>
              Tu pedido <strong>#{pedidoId}</strong> ha sido procesado
              exitosamente
            </p>

            <p className='text-gray-500 text-sm mb-8'>
              Hemos enviado un correo de confirmación con los detalles de tu
              compra
            </p>

            {/* Información del pedido */}
            <div className='bg-gray-50 rounded-lg p-6 mb-8 text-left'>
              <h3 className='font-semibold text-gray-900 mb-4 flex items-center'>
                <ShoppingBag className='w-5 h-5 mr-2 text-blue-600' />
                Resumen del Pedido
              </h3>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Número de pedido:</span>
                  <span className='font-medium'>#{pedidoId}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Estado:</span>
                  <span className='text-green-600 font-medium'>Confirmado</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Fecha:</span>
                  <span className='font-medium'>
                    {new Date().toLocaleDateString('es-BO')}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className='space-y-4'>
              <button className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center'>
                <Download className='w-5 h-5 mr-2' />
                Descargar Comprobante
              </button>

              <Link
                to='/catalogo'
                className='w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center'
              >
                Seguir Comprando
                <ArrowRight className='w-4 h-4 ml-2' />
              </Link>

              <Link
                to='/mis-pedidos'
                className='text-blue-600 hover:text-blue-700 text-sm font-medium inline-block'
              >
                Ver mis pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PedidoExitosoPage
