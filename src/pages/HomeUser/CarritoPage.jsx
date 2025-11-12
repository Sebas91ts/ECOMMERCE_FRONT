// src/pages/Carrito/CarritoPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCarrito } from '../../contexts/CarritoContext'

const CarritoPage = () => {
  const {
    carrito,
    productos,
    loading,
    error,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarElCarrito,
    totalItems
  } = useCarrito()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price)
  }

  const handleIncrementar = async (producto) => {
    await agregarAlCarrito(producto.producto_id, 1)
  }

  const handleDecrementar = async (producto) => {
    await eliminarDelCarrito(producto.producto_id, 1)
  }

  const handleEliminar = async (producto) => {
    await eliminarDelCarrito(producto.producto_id, -1)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='container mx-auto px-4'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='bg-white rounded-lg shadow-sm p-6'>
                  <div className='flex gap-4'>
                    <div className='w-20 h-20 bg-gray-200 rounded'></div>
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                      <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                      <div className='h-6 bg-gray-200 rounded w-1/4'></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='container mx-auto px-4'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
            <p className='text-red-600 mb-4'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='container mx-auto px-4'>
          <div className='max-w-2xl mx-auto text-center'>
            <div className='bg-white rounded-lg shadow-sm p-12'>
              <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <ShoppingBag className='w-12 h-12 text-gray-400' />
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Tu carrito está vacío
              </h2>
              <p className='text-gray-600 mb-8'>
                ¡Descubre nuestros productos y encuentra lo que necesitas!
              </p>
              <Link
                to='/catalogo'
                className='bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center'
              >
                Explorar Catálogo
                <ArrowRight className='w-4 h-4 ml-2' />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Mi Carrito</h1>
              <p className='text-gray-600 mt-2'>
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu
                carrito
              </p>
            </div>
            <button
              onClick={vaciarElCarrito}
              className='text-red-600 hover:text-red-700 font-medium flex items-center'
            >
              <Trash2 className='w-4 h-4 mr-1' />
              Vaciar carrito
            </button>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Lista de Productos */}
            <div className='lg:col-span-2 space-y-4'>
              {productos.map((producto) => (
                <div
                  key={producto.producto_id}
                  className='bg-white rounded-lg shadow-sm border p-6'
                >
                  <div className='flex gap-4'>
                    {/* Imagen del Producto */}
                    <div className='w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <ShoppingBag className='w-8 h-8 text-gray-400' />
                    </div>

                    {/* Información del Producto */}
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        {producto.nombre}
                      </h3>
                      <p className='text-lg font-bold text-blue-600 mb-3'>
                        {formatPrice(producto.precio_unitario)}
                      </p>

                      {/* Controles de Cantidad */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <button
                            onClick={() => handleDecrementar(producto)}
                            disabled={producto.cantidad <= 1}
                            className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            <Minus className='w-3 h-3' />
                          </button>
                          <span className='font-semibold text-gray-900 w-8 text-center'>
                            {producto.cantidad}
                          </span>
                          <button
                            onClick={() => handleIncrementar(producto)}
                            disabled={producto.cantidad >= producto.stock}
                            className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            <Plus className='w-3 h-3' />
                          </button>
                        </div>

                        <div className='text-right'>
                          <p className='text-sm text-gray-600'>Subtotal</p>
                          <p className='text-lg font-bold text-gray-900'>
                            {formatPrice(producto.subtotal)}
                          </p>
                        </div>
                      </div>

                      {/* Stock y Eliminar */}
                      <div className='flex justify-between items-center mt-3 pt-3 border-t border-gray-100'>
                        <span
                          className={`text-sm ${
                            producto.stock > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {producto.stock > 0
                            ? `${producto.stock} disponibles`
                            : 'Sin stock'}
                        </span>
                        <button
                          onClick={() => handleEliminar(producto)}
                          className='text-red-600 hover:text-red-700 text-sm font-medium flex items-center'
                        >
                          <Trash2 className='w-3 h-3 mr-1' />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del Pedido */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-lg shadow-sm border p-6 sticky top-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Resumen del Pedido
                </h3>

                <div className='space-y-3 mb-6'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>
                      Productos ({totalItems})
                    </span>
                    <span className='text-gray-900'>
                      {formatPrice(carrito?.total || 0)}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Envío</span>
                    <span className='text-green-600'>Gratis</span>
                  </div>
                  <div className='border-t border-gray-200 pt-3'>
                    <div className='flex justify-between text-lg font-bold'>
                      <span>Total</span>
                      <span className='text-blue-600'>
                        {formatPrice(carrito?.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to='/home/checkout'
                  className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center block'
                >
                  Proceder al Pago
                </Link>

                <Link
                  to='/home/catalogo'
                  className='w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center block'
                >
                  Seguir Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarritoPage
