import React, { createContext, useReducer, useEffect } from 'react'
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  refresh as apiRefresh
} from '../api/auth/login'
// Estados de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null
      }

    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: action.payload
      }

    case 'REFRESH_TOKEN':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      }

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null
      }

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Estado inicial
// Ver si hay datos guardados en localStorage
const storedAuth = localStorage.getItem('authData')
const initialState = {
  isAuthenticated: storedAuth ? true : false,
  user: storedAuth ? JSON.parse(storedAuth).user : null,
  accessToken: storedAuth ? JSON.parse(storedAuth).accessToken : null,
  refreshToken: storedAuth ? JSON.parse(storedAuth).refreshToken : null,
  loading: false, // si hay datos, ya no está "cargando"
  error: null
}

// Crear contexto
export const AuthContext = createContext()

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Cargar datos del localStorage al iniciar - SOLO UNA VEZ al montar
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedAuth = localStorage.getItem('authData')
        if (storedAuth) {
          const { user, accessToken, refreshToken } = JSON.parse(storedAuth)

          // Verificar si el token no ha expirado
          if (isTokenValid(accessToken)) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, accessToken, refreshToken }
            })
          } else if (refreshToken && isTokenValid(refreshToken)) {
            // Intentar renovar el token si el refresh token es válido
            refreshAccessToken(refreshToken)
          } else {
            // Limpiar datos inválidos
            localStorage.removeItem('authData')
            dispatch({ type: 'LOGOUT' })
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error)
        localStorage.removeItem('authData')
      }
    }

    loadStoredAuth()
  }, [])

  // Guardar en localStorage cuando cambie el estado de auth
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      accessToken: state.accessToken
    })

    if (state.isAuthenticated && state.user && state.accessToken) {
      const authData = {
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }
      localStorage.setItem('authData', JSON.stringify(authData))
    } else if (!state.isAuthenticated) {
      localStorage.removeItem('authData')
    }
  }, [state.isAuthenticated, state.user, state.accessToken, state.refreshToken])

  // Verificar si el token es válido
  const isTokenValid = (token) => {
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      return false
    }
  }

  // Login
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiLogin(
        credentials.username,
        credentials.password
      )

      const values = response.data.values

      // Crear el payload de usuario
      const userPayload = {
        id: values.user.id,
        username: values.user.username,
        first_name: values.user.first_name,
        last_name: values.user.last_name,
        email: values.user.email,
        grupo_id: values.user.grupo_id, // ← CORREGIDO: values.user.grupo_id
        grupo_nombre: values.user.grupo_nombre, // ← CORREGIDO: values.user.grupo_nombre
        ci: values.user.ci,
        telefono: values.user.telefono,
        is_staff: values.user.is_staff,
        is_active: values.user.is_active
      }

      const loginPayload = {
        user: userPayload,
        accessToken: values.access,
        refreshToken: values.refresh
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: loginPayload
      })

      return { success: true, data: values }
    } catch (error) {
      console.error('Login error:', error)
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || error.message
      })
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }
  // Registro
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiRegister({
        username: userData.username,
        password: userData.password,
        password2: userData.password2,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        telefono: userData.telefono
      })

      const values = response.data.values

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            id: values.id,
            username: values.username,
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            grupo_id: values.grupo_id,
            grupo_nombre: values.grupo_nombre,
            ci: values.ci,
            telefono: values.telefono,
            is_staff: values.is_staff,
            is_active: values.is_active
          },
          accessToken: values.access,
          refreshToken: values.refresh
        }
      })

      return { success: true, data: values }
    } catch (error) {
      console.log('❌ Error completo del registro:', error)
      console.log('📋 Respuesta del error:', error.response)

      // Pasar el objeto completo de error para que parseApiError lo procese
      const errorData =
        error.response?.data || error.message || 'Error desconocido'

      console.log('📝 Datos de error procesados:', errorData)

      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorData
      })

      return {
        success: false,
        error: errorData // ← Pasar el objeto completo, no solo el mensaje
      }
    }
  }

  // Refresh
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await apiRefresh(refreshToken)
      const values = response.data.values

      dispatch({
        type: 'REFRESH_TOKEN',
        payload: {
          accessToken: values.access,
          refreshToken: values.refresh || refreshToken
        }
      })

      return values.access
    } catch (error) {
      console.error('Error refreshing token:', error)
      logout()
      return null
    }
  }

  // Logout
  const logout = async () => {
    try {
      if (state.refreshToken) {
        await apiLogout()
      }
    } catch (error) {
      console.error('Error during logout:', error)
    }
    dispatch({ type: 'LOGOUT' })
  }

  // Actualizar información del usuario
  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    })
  }

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Interceptor para requests automáticos con token
  const authenticatedFetch = async (url, options = {}) => {
    let token = state.accessToken

    // Verificar si el token necesita renovarse
    if (!isTokenValid(token) && state.refreshToken) {
      token = await refreshAccessToken(state.refreshToken)
    }

    if (!token) {
      throw new Error('No valid token available')
    }

    const authenticatedOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const response = await fetch(url, authenticatedOptions)

    // Si el token expiró, intentar renovarlo una vez más
    if (response.status === 401 && state.refreshToken) {
      const newToken = await refreshAccessToken(state.refreshToken)
      if (newToken) {
        authenticatedOptions.headers['Authorization'] = `Bearer ${newToken}`
        return fetch(url, authenticatedOptions)
      }
    }

    return response
  }

  const value = {
    // Estado
    ...state,

    // Acciones
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshAccessToken,
    authenticatedFetch,

    // Utilidades
    isTokenValid
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
