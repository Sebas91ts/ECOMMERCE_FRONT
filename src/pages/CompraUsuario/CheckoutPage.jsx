import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../../contexts/CarritoContext'
import { useApi } from '../../hooks/useApi'
import { listarFormasPagoActivasUsuario } from '../../api/carrito/carrito'
import { CreditCard, Shield, Truck, ArrowLeft } from 'lucide-react'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { carrito, productos, generarElPedido, clearError } = useCarrito()
  const [formasPago, setFormasPago] = useState([])
  const [selectedFormaPago, setSelectedFormaPago] = useState('')
  const [mesesCredito, setMesesCredito] = useState(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { execute: fetchFormasPago } = useApi(listarFormasPagoActivasUsuario)

  useEffect(() => {
    loadFormasPago()
  }, [])

  const loadFormasPago = async () => {
    try {
      const response = await fetchFormasPago()
      if (response?.data?.values?.formas_pago) {
        setFormasPago(response.data.values.formas_pago)
      }
    } catch (error) {
      console.error('Error cargando formas de pago:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFormaPago) {
      setError('Por favor selecciona una forma de pago')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formaPago = formasPago.find((fp) => fp.id == selectedFormaPago)

      // Validar meses de crédito
      let meses = null
      if (formaPago?.nombre.toLowerCase() === 'credito') {
        if (!mesesCredito) {
          setError('Debe seleccionar los meses de crédito')
          setLoading(false)
          return
        }
        meses = mesesCredito
      }

      const resultado = await generarElPedido(selectedFormaPago, meses)

      if (resultado.success) {
        // ✅ Manejar diferentes estados del pedido
        if (resultado.values.estado === 'confirmado') {
          // Pedido confirmado inmediatamente (tarjetas)
          navigate(`/home/pedido-exitoso/${resultado.values.pedido_id}`)
        } else if (resultado.values.estado === 'pendiente') {
          // Pedido pendiente (crédito u otros métodos)
          navigate(`/home/pedido-pendiente/${resultado.values.pedido_id}`)
        } else {
          // Estado por defecto
          navigate(`/home/pedido-exitoso/${resultado.values.pedido_id}`)
        }
      } else {
        // ✅ Mostrar errores específicos del backend
        setError(resultado.message || 'Error al procesar el pedido')
      }
    } catch (error) {
      setError('Error de conexión al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price)
  }

  const selectedPago = formasPago.find((fp) => fp.id == selectedFormaPago)
  const esCredito = selectedPago?.nombre.toLowerCase() === 'credito'

  if (!carrito || productos.length === 0) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='container mx-auto px-4'>
          <div className='max-w-2xl mx-auto text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Carrito vacío
            </h2>
            <p className='text-gray-600 mb-8'>No hay productos para procesar</p>
            <button
              onClick={() => navigate('/catalogo')}
              className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700'
            >
              Ir al Catálogo
            </button>
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
          <div className='mb-8'>
            <button
              onClick={() => navigate('/home/carrito')}
              className='flex items-center text-blue-600 hover:text-blue-700 mb-4'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Volver al Carrito
            </button>
            <h1 className='text-3xl font-bold text-gray-900'>
              Finalizar Compra
            </h1>
            <p className='text-gray-600 mt-2'>
              Completa tu información de pago
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Formulario de Pago */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <CreditCard className='w-5 h-5 mr-2 text-blue-600' />
                Método de Pago
              </h2>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Formas de Pago */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-3'>
                    Selecciona forma de pago *
                  </label>
                  <div className='space-y-3'>
                    {formasPago.map((forma) => (
                      <div key={forma.id} className='flex items-center'>
                        <input
                          type='radio'
                          id={`pago-${forma.id}`}
                          name='forma_pago'
                          value={forma.id}
                          checked={selectedFormaPago == forma.id}
                          onChange={(e) => setSelectedFormaPago(e.target.value)}
                          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                        />
                        <label
                          htmlFor={`pago-${forma.id}`}
                          className='ml-3 block text-sm font-medium text-gray-700'
                        >
                          {forma.nombre}
                          {forma.descripcion && (
                            <span className='text-gray-500 text-xs block'>
                              {forma.descripcion}
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opciones de Crédito */}
                {esCredito && (
                  <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Plazo de crédito *
                    </label>
                    <select
                      value={mesesCredito}
                      onChange={(e) =>
                        setMesesCredito(parseInt(e.target.value))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      <option value=''>Selecciona los meses</option>
                      <option value={6}>6 meses</option>
                      <option value={12}>12 meses</option>
                      <option value={18}>18 meses</option>
                      <option value={24}>24 meses</option>
                    </select>
                    {mesesCredito && (
                      <div className='mt-3 space-y-1 text-sm'>
                        <p className='text-gray-600'>
                          Cuota mensual:{' '}
                          <span className='font-semibold'>
                            {formatPrice(carrito.total / mesesCredito)}
                          </span>
                        </p>
                        <p className='text-gray-500 text-xs'>
                          Total financiado: {formatPrice(carrito.total)}
                        </p>
                      </div>
                    )}
                    {!mesesCredito && (
                      <p className='text-red-500 text-xs mt-2'>
                        Debe seleccionar los meses de crédito
                      </p>
                    )}
                  </div>
                )}

                {/* Información de Seguridad */}
                <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                  <div className='flex items-center'>
                    <Shield className='w-5 h-5 text-green-600 mr-2' />
                    <span className='text-sm font-medium text-green-800'>
                      Compra 100% segura
                    </span>
                  </div>
                  <p className='text-xs text-green-600 mt-1'>
                    Tus datos están protegidos y tu transacción es segura
                  </p>
                </div>

                {/* Botón de Confirmación */}
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading
                    ? 'Procesando...'
                    : `Confirmar Pedido - ${formatPrice(carrito.total)}`}
                </button>

                {error && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                    <p className='text-red-600 text-sm'>{error}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Resumen del Pedido */}
            <div className='bg-white rounded-lg shadow-sm border p-6 h-fit sticky top-4'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Resumen del Pedido
              </h3>

              <div className='space-y-4 mb-6'>
                {productos.map((producto) => (
                  <div
                    key={producto.producto_id}
                    className='flex justify-between items-start border-b border-gray-100 pb-3'
                  >
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900 text-sm'>
                        {producto.nombre}
                      </p>
                      <p className='text-gray-500 text-xs'>
                        Cantidad: {producto.cantidad}
                      </p>
                    </div>
                    <span className='font-semibold text-gray-900'>
                      {formatPrice(producto.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className='space-y-2 border-t border-gray-200 pt-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='text-gray-900'>
                    {formatPrice(carrito.total)}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Envío</span>
                  <span className='text-green-600'>Gratis</span>
                </div>
                <div className='flex justify-between text-lg font-bold border-t border-gray-200 pt-2'>
                  <span>Total</span>
                  <span className='text-blue-600'>
                    {formatPrice(carrito.total)}
                  </span>
                </div>
              </div>

              {/* Información de Entrega */}
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <div className='flex items-center text-sm text-gray-600'>
                  <Truck className='w-4 h-4 mr-2' />
                  Entrega en 3-5 días hábiles
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
