// src/sw.js
import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

// Estrategia para APIs - INCLUYENDO origen cruzado
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  console.log('[SW] Intercepting request:', request.url, request.method)

  // Solo manejar requests GET (ahora incluimos origen cruzado para APIs)
  if (request.method !== 'GET') {
    return
  }

  // ESTRATEGIA PARA APIS (incluyendo APIs externas)
  if (url.pathname.includes('/api/') || 
      url.href.includes('/producto/') || 
      url.href.includes('127.0.0.1:8000')) {
    
    event.respondWith(
      (async () => {
        const cache = await caches.open('api-data')
        
        try {
          // Primero intentar red
          const networkResponse = await fetch(request)
          
          // Solo cachear respuestas exitosas
          if (networkResponse.ok && networkResponse.status === 200) {
            // Clonar la respuesta porque solo se puede leer una vez
            const responseClone = networkResponse.clone()
            
            // Crear una nueva request para cachear (sin credenciales para evitar problemas CORS)
            const cacheRequest = new Request(request.url, {
              headers: request.headers,
              method: 'GET'
            })
            
            cache.put(cacheRequest, responseClone)
            console.log('[SW] API response cached:', request.url)
          }
          
          return networkResponse
        } catch (error) {
          // Si falla la red, buscar en caché
          console.log('[SW] Network failed, trying cache for:', request.url)
          const cachedResponse = await cache.match(request)
          
          if (cachedResponse) {
            console.log('[SW] Serving API from cache:', request.url)
            // Añadir header para identificar que son datos cacheados
            const headers = new Headers(cachedResponse.headers)
            headers.set('X-Offline-Cache', 'true')
            
            return new Response(cachedResponse.body, {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers: headers
            })
          }
          
          // Si no hay en caché, devolver error apropiado
          return new Response(
            JSON.stringify({ 
              error: 'No connection and no cached data',
              offline: true,
              message: 'No hay conexión y no hay datos en caché'
            }),
            {
              status: 503,
              headers: { 
                'Content-Type': 'application/json',
                'X-Offline-Cache': 'true'
              }
            }
          )
        }
      })()
    )
    return
  }

  // Estrategia para HTML pages (mantener igual)
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request)
          const cache = await caches.open('pages')
          cache.put(request, networkResponse.clone())
          return networkResponse
        } catch (error) {
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url)
            return cachedResponse
          }
          return caches.match('/offline.html')
        }
      })()
    )
    return
  }

  // Para archivos estáticos del mismo origen
  if (url.origin === self.location.origin &&
      (request.destination === 'script' || 
       request.destination === 'style' || 
       request.destination === 'image' ||
       request.url.includes('.js') ||
       request.url.includes('.css'))) {
    
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open('static').then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
    )
  }
})
// Cache inicial
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open('pages').then((cache) => {
      return cache.addAll([
        '/',
        '/login',
        '/dashboard',
        '/home'
      ])
    })
  )
})

// Limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!['pages', 'static', 'api-data'].includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})