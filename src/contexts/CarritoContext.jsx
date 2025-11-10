// contexts/CarritoContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import {
  agregarProductoCarrito,
  vaciarCarrito,
  eliminarProductoCarrito,
  generarPedido,
  obtenerMiCarrito
} from '../api/carrito/carrito'

const CarritoContext = createContext()

// Reducer para manejar el estado del carrito
const carritoReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CARRITO':
      return {
        ...state,
        carrito: action.payload.carrito,
        productos: action.payload.productos,
        loading: false
      }
    case 'ADD_ITEM':
      const existingItem = state.productos.find(
        (p) => p.producto_id === action.payload.producto_id
      )

      if (existingItem) {
        // Actualizar cantidad si ya existe
        const updatedProductos = state.productos.map((p) =>
          p.producto_id === action.payload.producto_id
            ? { ...p, cantidad: p.cantidad + action.payload.cantidad }
            : p
        )
        return {
          ...state,
          productos: updatedProductos,
          carrito: {
            ...state.carrito,
            total: state.carrito.total + action.payload.subtotal
          }
        }
      } else {
        // Agregar nuevo producto
        return {
          ...state,
          productos: [...state.productos, action.payload],
          carrito: {
            ...state.carrito,
            total: state.carrito.total + action.payload.subtotal
          }
        }
      }

    case 'REMOVE_ITEM':
      const itemToRemove = state.productos.find(
        (p) => p.producto_id === action.payload.producto_id
      )
      if (!itemToRemove) return state

      const cantidadAEliminar = action.payload.cantidad || itemToRemove.cantidad
      const subtotalARestar = itemToRemove.precio_unitario * cantidadAEliminar

      if (cantidadAEliminar >= itemToRemove.cantidad) {
        // Eliminar completamente el producto
        const filteredProductos = state.productos.filter(
          (p) => p.producto_id !== action.payload.producto_id
        )
        return {
          ...state,
          productos: filteredProductos,
          carrito: {
            ...state.carrito,
            total: Math.max(0, state.carrito.total - subtotalARestar)
          }
        }
      } else {
        // Reducir cantidad
        const updatedProductos = state.productos.map((p) =>
          p.producto_id === action.payload.producto_id
            ? { ...p, cantidad: p.cantidad - cantidadAEliminar }
            : p
        )
        return {
          ...state,
          productos: updatedProductos,
          carrito: {
            ...state.carrito,
            total: Math.max(0, state.carrito.total - subtotalARestar)
          }
        }
      }

    case 'CLEAR_CARRITO':
      return {
        ...state,
        carrito: { ...state.carrito, total: 0 },
        productos: []
      }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }

    default:
      return state
  }
}

const initialState = {
  carrito: null,
  productos: [],
  loading: false,
  error: null
}

export const CarritoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState)

  // Hooks para las APIs
  const { execute: fetchCarrito } = useApi(obtenerMiCarrito)
  const { execute: addToCart } = useApi(agregarProductoCarrito)
  const { execute: removeFromCart } = useApi(eliminarProductoCarrito)
  const { execute: clearCart } = useApi(vaciarCarrito)
  const { execute: createOrder } = useApi(generarPedido)

  // Cargar carrito al iniciar
  const cargarCarrito = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetchCarrito()

      if (response?.data?.status === 1) {
        dispatch({
          type: 'SET_CARRITO',
          payload: {
            carrito: {
              id: response.data.values.carrito_id,
              total: response.data.values.total
            },
            productos: response.data.values.productos
          }
        })
      } else {
        // No hay carrito activo, inicializar vacío
        dispatch({
          type: 'SET_CARRITO',
          payload: {
            carrito: { id: null, total: 0 },
            productos: []
          }
        })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  // Agregar producto al carrito
  const agregarAlCarrito = async (productoId, cantidad = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await addToCart({
        producto_id: productoId,
        cantidad: cantidad
      })

      if (response?.data?.status === 1) {
        // Recargar el carrito completo para tener datos actualizados
        await cargarCarrito()
        return { success: true, message: response.data.message }
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response?.data?.message || 'Error al agregar al carrito'
        })
        return { success: false, message: response?.data?.message }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      return { success: false, message: error.message }
    }
  }

  // Eliminar producto del carritos
  const eliminarDelCarrito = async (productoId, cantidad = -1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await removeFromCart({
        producto_id: productoId,
        cantidad: cantidad
      })

      if (response?.data?.status === 1) {
        dispatch({
          type: 'REMOVE_ITEM',
          payload: {
            producto_id: productoId,
            cantidad: cantidad === -1 ? undefined : cantidad
          }
        })
        return { success: true, message: response.data.message }
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response?.data?.message || 'Error al eliminar del carrito'
        })
        return { success: false, message: response?.data?.message }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      return { success: false, message: error.message }
    } finally {
      // ✅ ESTO SE EJECUTA SIEMPRE, TANTO EN ÉXITO COMO EN ERROR
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Vaciar carrito completo
  const vaciarElCarrito = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await clearCart()

      if (response?.data?.status === 1) {
        dispatch({ type: 'CLEAR_CARRITO' })
        return { success: true, message: response.data.message }
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response?.data?.message || 'Error al vaciar carrito'
        })
        return { success: false, message: response?.data?.message }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      return { success: false, message: error.message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Generar pedido
  const generarElPedido = async (formaPagoId, mesesCredito = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const pedidoData = {
        forma_pago: formaPagoId
      }

      if (mesesCredito) {
        pedidoData.meses_credito = mesesCredito
      }

      const response = await createOrder(pedidoData)

      if (response?.data?.status === 1) {
        // Limpiar carrito después de generar pedido
        dispatch({ type: 'CLEAR_CARRITO' })
        return {
          success: true,
          message: response.data.message,
          pedidoId: response.data.values.pedido_id
        }
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response?.data?.message || 'Error al generar pedido'
        })
        return { success: false, message: response?.data?.message }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      return { success: false, message: error.message }
    }
  }

  // Calcular total de items
  const totalItems = state.productos.reduce(
    (total, producto) => total + producto.cantidad,
    0
  )

  // Verificar si un producto está en el carrito
  const estaEnCarrito = (productoId) => {
    return state.productos.some((p) => p.producto_id === productoId)
  }

  // Obtener cantidad de un producto en el carrito
  const cantidadEnCarrito = (productoId) => {
    const producto = state.productos.find((p) => p.producto_id === productoId)
    return producto ? producto.cantidad : 0
  }

  useEffect(() => {
    cargarCarrito()
  }, [])

  const value = {
    // Estado
    carrito: state.carrito,
    productos: state.productos,
    loading: state.loading,
    error: state.error,

    // Métodos
    cargarCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarElCarrito,
    generarElPedido,

    // Utilidades
    totalItems,
    estaEnCarrito,
    cantidadEnCarrito,

    // Reiniciar error
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null })
  }

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  )
}

// Hook personalizado para usar el carrito
export const useCarrito = () => {
  const context = useContext(CarritoContext)
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider')
  }
  return context
}
