/**
 * Offline Synchronization Utility
 * Handles queuing of requests when offline and syncing when back online
 */

const SYNC_QUEUE_KEY = "offline_sync_queue"

export class OfflineSync {
  constructor() {
    this.queue = this.loadQueue()
    this.syncing = false
    this.setupConnectionListener()
    console.log('[OfflineSync] ✅ Initialized, queue size:', this.queue.length)
  }

  // Load pending requests from localStorage
  loadQueue() {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY)
    const queue = stored ? JSON.parse(stored) : []
    console.log('[OfflineSync] 📥 Loaded queue from storage:', queue.length, 'items')
    return queue
  }

  // Save queue to localStorage
  saveQueue() {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue))
    console.log('[OfflineSync] 💾 Saved queue to storage:', this.queue.length, 'items')
  }

  // Add request to sync queue
  addToQueue(method, url, data, timestamp = Date.now()) {
  // Convertir URL relativa a absoluta si es necesario
  let absoluteUrl = url;
  if (!url.startsWith('http')) {
    // Usar la baseURL de tu API
    const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";
    absoluteUrl = `${baseURL}${url.startsWith('/') ? url.slice(1) : url}`;
  }

  const request = {
    id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    method,
    url: absoluteUrl, // ← Usar URL absoluta
    data,
    timestamp,
    retries: 0,
    maxRetries: 3,
  }

  this.queue.push(request)
  this.saveQueue()
  console.log(`[OfflineSync] 📝 Request queued: ${method} ${absoluteUrl}`, request)
  
  this.dispatchQueueUpdate()
  return request
}

  // Remove request from queue
  removeFromQueue(id) {
    this.queue = this.queue.filter((req) => req.id !== id)
    this.saveQueue()
    console.log(`[OfflineSync] 🗑️ Removed from queue: ${id}`)
    this.dispatchQueueUpdate()
  }

  // Setup online/offline event listeners
  setupConnectionListener() {
    const handleOnline = () => {
      console.log('[OfflineSync] 🌐 Connection restored, starting sync...')
      this.syncQueue()
    }

    const handleOffline = () => {
      console.log('[OfflineSync] 🔌 Connection lost, requests will be queued')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    console.log('[OfflineSync] 📡 Connection listeners setup complete')
  }

  // Sync all pending requests
  async syncQueue() {
    if (this.syncing) {
      console.log('[OfflineSync] ⏳ Sync already in progress')
      return
    }

    if (this.queue.length === 0) {
      console.log('[OfflineSync] ✅ No pending requests to sync')
      return
    }

    this.syncing = true
    console.log(`[OfflineSync] 🚀 Starting sync of ${this.queue.length} requests`)

    // Crear copia de la cola para iterar
    const queueCopy = [...this.queue]
    let successCount = 0
    let errorCount = 0

    for (const request of queueCopy) {
      try {
        console.log(`[OfflineSync] 🔄 Syncing: ${request.method} ${request.url}`)
        
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            "Content-Type": "application/json",
            ...this.getAuthHeaders(),
          },
          body: request.data ? JSON.stringify(request.data) : undefined,
        })

        if (response.ok) {
          this.removeFromQueue(request.id)
          successCount++
          console.log(`[OfflineSync] ✅ Synced successfully: ${request.method} ${request.url}`)
          this.dispatchSyncEvent("success", request)
        } else if (response.status === 401) {
          // Auth failed, remove from queue
          this.removeFromQueue(request.id)
          console.log(`[OfflineSync] 🔐 Auth failed, removed: ${request.method} ${request.url}`)
          this.dispatchSyncEvent("auth_failed", request)
        } else if (request.retries < request.maxRetries) {
          request.retries++
          this.saveQueue()
          console.log(`[OfflineSync] 🔄 Retry ${request.retries}/${request.maxRetries}: ${request.method} ${request.url}`)
        } else {
          // Max retries reached, remove
          this.removeFromQueue(request.id)
          errorCount++
          console.log(`[OfflineSync] ❌ Max retries reached: ${request.method} ${request.url}`)
          this.dispatchSyncEvent("max_retries", request)
        }
      } catch (error) {
        console.error(`[OfflineSync] ❌ Sync failed: ${request.method} ${request.url}`, error)
        if (request.retries < request.maxRetries) {
          request.retries++
          this.saveQueue()
          console.log(`[OfflineSync] 🔄 Retry ${request.retries}/${request.maxRetries} after error: ${request.method} ${request.url}`)
        } else {
          this.removeFromQueue(request.id)
          errorCount++
          console.log(`[OfflineSync] ❌ Max retries reached after errors: ${request.method} ${request.url}`)
          this.dispatchSyncEvent("error", request, error)
        }
      }
    }

    this.syncing = false
    console.log(`[OfflineSync] 🏁 Sync complete. Success: ${successCount}, Errors: ${errorCount}, Remaining: ${this.queue.length}`)
    
    // Disparar evento de finalización
    this.dispatchSyncComplete(successCount, errorCount)
  }

  // Get authentication headers
  getAuthHeaders() {
    try {
      const authData = JSON.parse(localStorage.getItem("authData") || "{}")
      const headers = authData.accessToken ? { Authorization: `Bearer ${authData.accessToken}` } : {}
      console.log('[OfflineSync] 🔑 Auth headers:', headers)
      return headers
    } catch (error) {
      console.error('[OfflineSync] ❌ Error getting auth headers:', error)
      return {}
    }
  }

  // Dispatch custom event for sync completion
  dispatchSyncEvent(type, request, error = null) {
    const eventDetail = { type, request, error }
    window.dispatchEvent(
      new CustomEvent("offline-sync", {
        detail: eventDetail,
      })
    )
    console.log(`[OfflineSync] 📢 Sync event: ${type}`, eventDetail)
  }

  // Dispatch sync complete event
  dispatchSyncComplete(successCount, errorCount) {
    window.dispatchEvent(
      new CustomEvent("offline-sync-complete", {
        detail: { successCount, errorCount, remaining: this.queue.length }
      })
    )
    console.log(`[OfflineSync] 📢 Sync complete event: ${successCount} success, ${errorCount} errors`)
  }

  // Dispatch queue update event
  dispatchQueueUpdate() {
    window.dispatchEvent(
      new CustomEvent("offline-queue-update", {
        detail: { queueSize: this.queue.length }
      })
    )
  }

  // Get queue status
  getStatus() {
    return {
      queued: this.queue.length,
      syncing: this.syncing,
      isOnline: navigator.onLine,
    }
  }

  // Manual sync trigger
  async manualSync() {
    console.log('[OfflineSync] 🎮 Manual sync triggered')
    await this.syncQueue()
  }

  // Clear queue
  clearQueue() {
    this.queue = []
    this.saveQueue()
    console.log('[OfflineSync] 🧹 Queue cleared')
    this.dispatchQueueUpdate()
  }
}

// Export singleton instance
export const offlineSync = new OfflineSync()