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
  }

  // Load pending requests from localStorage
  loadQueue() {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Save queue to localStorage
  saveQueue() {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue))
  }

  // Add request to sync queue
  addToQueue(method, url, data, timestamp = Date.now()) {
    const request = {
      id: `${timestamp}-${Math.random()}`,
      method,
      url,
      data,
      timestamp,
      retries: 0,
      maxRetries: 3,
    }

    this.queue.push(request)
    this.saveQueue()
    console.log(`[OfflineSync] Request queued: ${method} ${url}`)
    return request
  }

  // Remove request from queue
  removeFromQueue(id) {
    this.queue = this.queue.filter((req) => req.id !== id)
    this.saveQueue()
  }

  // Setup online/offline event listeners
  setupConnectionListener() {
    window.addEventListener("online", () => {
      console.log("[OfflineSync] Connection restored, syncing...")
      this.syncQueue()
    })

    window.addEventListener("offline", () => {
      console.log("[OfflineSync] Connection lost, queuing requests")
    })
  }

  // Sync all pending requests
  async syncQueue() {
    if (this.syncing || this.queue.length === 0) {
      return
    }

    this.syncing = true
    console.log(`[OfflineSync] Starting sync of ${this.queue.length} requests`)

    for (const request of [...this.queue]) {
      try {
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
          console.log(`[OfflineSync] Synced: ${request.method} ${request.url}`)
          this.dispatchSyncEvent("success", request)
        } else if (response.status === 401) {
          // Auth failed, remove from queue
          this.removeFromQueue(request.id)
          this.dispatchSyncEvent("auth_failed", request)
        } else if (request.retries < request.maxRetries) {
          request.retries++
          this.saveQueue()
        }
      } catch (error) {
        console.error(`[OfflineSync] Sync failed:`, error)
        if (request.retries < request.maxRetries) {
          request.retries++
          this.saveQueue()
        }
      }
    }

    this.syncing = false
    console.log(`[OfflineSync] Sync complete. Remaining: ${this.queue.length}`)
  }

  // Get authentication headers
  getAuthHeaders() {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}")
    return authData.accessToken ? { Authorization: `Bearer ${authData.accessToken}` } : {}
  }

  // Dispatch custom event for sync completion
  dispatchSyncEvent(type, request) {
    window.dispatchEvent(
      new CustomEvent("offline-sync", {
        detail: { type, request },
      }),
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
}

// Export singleton instance
export const offlineSync = new OfflineSync()
