import { useState, useCallback } from "react"
import instancia from "../api/axios"

export function useOfflineApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [queued, setQueued] = useState(false)
  const [isOfflineData, setIsOfflineData] = useState(false)

  const request = useCallback(async (method, url, payload = null) => {
    setLoading(true)
    setError(null)
    setQueued(false)
    setIsOfflineData(false)

    try {
      let response

      if (method.toUpperCase() === "GET") {
        response = await instancia.get(url)
        // Verificar si son datos offline del cache
        if (response.data?.offline) {
          setIsOfflineData(true)
        }
      } else if (method.toUpperCase() === "POST") {
        response = await instancia.post(url, payload)
      } else if (method.toUpperCase() === "PUT") {
        response = await instancia.put(url, payload)
      } else if (method.toUpperCase() === "DELETE") {
        response = await instancia.delete(url)
      } else if (method.toUpperCase() === "PATCH") {
        response = await instancia.patch(url, payload)
      }

      // Check if request was queued for offline sync
      if (response.status === 202 && response.data.queued) {
        setQueued(true)
        console.log("[useOfflineApi] Request queued for sync")
      } else {
        setData(response.data)
      }

      return response
    } catch (err) {
      // Manejar errores offline específicos
      if (err.isOffline) {
        setError(new Error('Modo offline: ' + (err.offlineMessage || 'No hay datos disponibles')))
        setIsOfflineData(true)
      } else {
        setError(err.message || "An error occurred")
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    data,
    queued,
    isOfflineData,
    request,
  }
}