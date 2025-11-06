import { useNavigate, useLocation } from 'react-router-dom'

export default function UserAvatar({ user }) {
  const navigate = useNavigate()
  const location = useLocation()

  const initial = user.username ? user.username[0].toUpperCase() : '?'

  const handleClick = () => {
    // Tomamos solo el primer segmento de la ruta
    const primerSegmento = location.pathname.split('/')[1] || ''
    navigate(`/${primerSegmento}/editar-perfil`)
  }

  return (
    <div
      className='w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition'
      onClick={handleClick}
      title={`Ir a editar perfil de ${user.username}`}
    >
      <span className='font-bold'>{initial}</span>
    </div>
  )
}
