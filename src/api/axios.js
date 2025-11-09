import axios from "axios"
import { offlineSync } from "../utils/offlineSync"

const instancia = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/",
})

instancia.interceptors.request.use(
  (config) => {
    const authData = JSON.parse(localStorage.getItem("authData"))
    const token = authData?.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

instancia.interceptors.response.use(
  (response) => {
    // Detectar si la respuesta viene del cache offline
    const isFromOfflineCache = response.headers['x-offline-cache'] === 'true'
    
    if (isFromOfflineCache) {
      console.log('[Axios] Response from offline cache')
      response.offline = true
      
      // Si es un error 503 del cache, manejarlo como offline
      if (response.status === 503 && response.data?.offline) {
        const error = new Error('Offline: No cached data available')
        error.isOffline = true
        error.response = response
        throw error
      }
    }
    
    return response
  },
  (error) => {
    // Si estamos offline
    if (!navigator.onLine || error.isOffline) {
      const method = error.config?.method?.toUpperCase()
      const url = error.config?.url

      // Para requests de escritura (POST, PUT, DELETE, PATCH), poner en cola
      if (method && url && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        console.log(`[Axios] Queuing offline request: ${method} ${url}`)
        
        try {
          const data = error.config.data ? JSON.parse(error.config.data) : null
          const queuedRequest = offlineSync.addToQueue(method, url, data)
          
          return Promise.resolve({
            status: 202,
            data: { 
              message: "Request queued for offline sync", 
              queued: true,
              queueId: queuedRequest.id,
              timestamp: Date.now()
            }
          })
        } catch (parseError) {
          console.error("[Axios] Error queuing request:", parseError)
        }
      }
      
      // Para requests de lectura (GET), marcar como offline
      if (method === 'GET') {
        error.isOffline = true
        error.offlineMessage = "No hay conexión y no hay datos en caché"
      }
    }

    return Promise.reject(error)
  }
)

export default instancia