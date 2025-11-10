// src/sw.js
import { precacheAndRoute } from 'workbox-precaching'

// Precache los archivos estáticos de Workbox
precacheAndRoute(self.__WB_MANIFEST)


self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)



  // Solo manejar requests GET
  if (request.method !== 'GET') {
    return
  }

  // ESTRATEGIA PARA APIS
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
            const responseClone = networkResponse.clone()
            const cacheRequest = new Request(request.url, {
              headers: request.headers,
              method: 'GET'
            })
            
            cache.put(cacheRequest, responseClone)
          }
          
          return networkResponse
        } catch (error) {
          // Si falla la red, buscar en caché
          const cachedResponse = await cache.match(request)
          
          if (cachedResponse) {
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

  // Estrategia para HTML pages (navegación)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Primero intentar red para páginas
          const networkResponse = await fetch(request)
          
          // Cachear la respuesta exitosa
          if (networkResponse.ok) {
            const cache = await caches.open('pages')
            cache.put(request, networkResponse.clone())
          }
          
          return networkResponse
        } catch (error) {
          // Si falla la red, buscar en caché
          const cachedResponse = await caches.match(request)
          
          if (cachedResponse) {
            return cachedResponse
          }
          
          // Si no hay en caché, devolver offline.html
          return caches.match('/offline.html')
        }
      })()
    )
    return
  }

  // PARA ARCHIVOS ESTÁTICOS (JS, CSS, imágenes) - DEJAR QUE WORKBOX LOS MANEJE
  // No añadir event.respondWith() para estos, dejar que pase al precaching de Workbox
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.url.includes('.js') ||
      request.url.includes('.css')) {
    
    // IMPORTANTE: No interferir, dejar que Workbox maneje estos archivos
    return
  }

  // Para cualquier otro recurso, usar cache primero
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      
      return fetch(request).then((response) => {
        // Cachear respuesta exitosa
        if (response.ok) {
          const responseClone = response.clone()
          caches.open('static').then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      }).catch(() => {
        // Si falla, devolver error genérico
        return new Response('Resource unavailable offline', { 
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        })
      })
    })
  )
})

// Cache inicial de páginas HTML
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('pages').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/offline.html'
      ]).catch(err => {
      })
    })
  )
})

// Limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!['pages', 'static', 'api-data'].includes(cacheName) && 
              !cacheName.includes('workbox-precache')) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})