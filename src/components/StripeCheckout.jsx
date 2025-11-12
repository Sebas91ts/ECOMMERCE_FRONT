// StripeCheckout.jsx - Actualizado para enviar monto
import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { useCarrito } from '../contexts/CarritoContext'
import { crearPaymentIntentStripe } from '../api/stripe/stripeService'
import { CreditCard, Shield, Loader, AlertCircle, Lock } from 'lucide-react'

const stripePromise = loadStripe(
  'pk_test_51SS0796eQ2Uxw5r0MuaNOvjRsyf7cAofagSCx0WzgOnqQxwfF9nhhnfUNLsnzcuwqesc9IBc91H0f0Cv3udeytsb00hQ9R965g'
)

const StripeCheckoutForm = ({ formaPagoId, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { carrito } = useCarrito()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  // Crear Payment Intent al montar
  useEffect(() => {
    const initPaymentIntent = async () => {
      try {
        setLoading(true)

        // Enviar el monto del carrito al backend para validación
        const response = await crearPaymentIntentStripe(
          formaPagoId,
          carrito.total
        )

        if (response.data.status === 1) {
          setClientSecret(response.data.values.clientSecret)
          console.log('✅ Payment Intent creado con monto:', carrito.total)
        } else {
          throw new Error(response.data.message)
        }
      } catch (err) {
        console.error('Error creando Payment Intent:', err)
        const msg =
          err.response?.data?.message || 'Error al inicializar el pago'
        setError(msg)
        onError?.(msg)
      } finally {
        setLoading(false)
      }
    }

    if (carrito && carrito.total > 0) {
      initPaymentIntent()
    }
  }, [formaPagoId, carrito, onError])

  const handlePayClick = async () => {
    if (!stripe || !elements || !clientSecret) {
      console.error('Stripe no está listo')
      return
    }

    setLoading(true)
    setError('')

    try {
      const cardElement = elements.getElement(CardElement)

      // Verificar que clientSecret tenga el formato correcto
      if (!clientSecret.includes('_secret_')) {
        throw new Error('Client secret inválido')
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement
          }
        })

      if (stripeError) {
        setError(stripeError.message)
        onError?.(stripeError.message)
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Pago exitoso, PaymentIntent ID:', paymentIntent.id)
        onSuccess?.(paymentIntent.id)
      }
    } catch (err) {
      console.error('Error procesando pago:', err)
      setError(err.message || 'Error al procesar el pago')
      onError?.(err.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
        padding: '10px 12px'
      },
      invalid: { color: '#9e2146' }
    },
    hidePostalCode: true
  }

  if (!carrito || carrito.total === 0) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <p className='text-red-600'>El carrito está vacío</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Información del monto */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex justify-between items-center'>
          <span className='text-sm font-medium text-blue-800'>
            Total a pagar:
          </span>
          <span className='text-lg font-bold text-blue-900'>
            {carrito.total.toLocaleString('es-BO', {
              style: 'currency',
              currency: 'BOB'
            })}
          </span>
        </div>
      </div>

      {/* Tarjeta */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Información de la tarjeta
        </label>
        <div className='border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'>
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Botón de pago */}
      <button
        onClick={handlePayClick}
        disabled={loading || !stripe || !clientSecret}
        className='w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
      >
        {loading ? (
          <>
            <Loader className='w-5 h-5 mr-2 animate-spin' />
            Procesando pago...
          </>
        ) : (
          <>
            <Lock className='w-5 h-5 mr-2' />
            Pagar{' '}
            {carrito.total.toLocaleString('es-BO', {
              style: 'currency',
              currency: 'BOB'
            })}
          </>
        )}
      </button>

      {/* Estado de carga */}
      {!clientSecret && !error && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
          <p className='text-yellow-700 text-sm'>
            Inicializando pasarela de pago...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <AlertCircle className='w-5 h-5 text-red-600 mr-2' />
            <span className='text-red-600'>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapper
const StripeCheckout = ({ formaPagoId, onSuccess, onError }) => (
  <Elements stripe={stripePromise}>
    <StripeCheckoutForm
      formaPagoId={formaPagoId}
      onSuccess={onSuccess}
      onError={onError}
    />
  </Elements>
)

export default StripeCheckout
