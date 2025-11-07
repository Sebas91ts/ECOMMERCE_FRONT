import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePrivilegios } from '../hooks/usePrivilegio'

export default function PrivilegedRoute({ componente, accion, children }) {
  const { user } = useAuth()
  const { privilegios, loading } = usePrivilegios()
  const [redireccionar, setRedireccionar] = useState(false)

  // 🔍 Si hay acción, determinamos el campo exacto
  const accionCampo = accion
    ? {
        crear: 'puede_crear',
        leer: 'puede_leer',
        actualizar: 'puede_actualizar',
        eliminar: 'puede_eliminar',
        activar: 'puede_activar'
      }[accion.toLowerCase()] || 'puede_leer'
    : null

  useEffect(() => {
    if (!loading) {
      const tienePermiso = privilegios.some((p) => {
        if (p.componente.toLowerCase() !== componente.toLowerCase())
          return false

        if (accionCampo) {
          // Si hay acción específica
          return p[accionCampo] === true
        } else {
          // Si NO hay acción: basta con tener al menos un permiso en el componente
          return (
            p.puede_crear ||
            p.puede_leer ||
            p.puede_actualizar ||
            p.puede_eliminar ||
            p.puede_activar
          )
        }
      })

      if (
        !tienePermiso &&
        user?.grupo_nombre?.toLowerCase() !== 'administrador'
      ) {
        const timer = setTimeout(() => setRedireccionar(true), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [loading, privilegios, componente, accionCampo, user])

  if (loading) {
    return <div className='p-4 text-gray-500'>Cargando permisos...</div>
  }

  if (redireccionar) {
    return <Navigate to='/' replace />
  }

  // 👑 Administrador siempre tiene acceso
  if (user?.grupo_nombre?.toLowerCase() === 'administrador') {
    return children
  }

  // 🔐 Verificar nuevamente antes de mostrar contenido
  const tienePermiso = privilegios.some((p) => {
    if (p.componente?.trim().toLowerCase() !== componente?.trim().toLowerCase())
      return false

    if (accionCampo) {
      return p[accionCampo] === true
    } else {
      return (
        p.puede_crear ||
        p.puede_leer ||
        p.puede_actualizar ||
        p.puede_eliminar ||
        p.puede_activar
      )
    }
  })

  if (tienePermiso) {
    return children
  }

  // 🚫 Mensaje de acceso denegado
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='flex flex-col items-center p-4 bg-red-100 border border-red-400 rounded'>
        <h1 className='text-2xl font-bold text-red-700'>Acceso denegado</h1>
        <p className='text-red-600 mt-1'>
          No tienes permisos para acceder al módulo <b>{componente}</b>
          {accion ? (
            <>
              {' '}
              con la acción <b>{accion}</b>.
            </>
          ) : (
            '.'
          )}{' '}
          Serás redirigido al dashboard.
        </p>
      </div>
    </div>
  )
}
