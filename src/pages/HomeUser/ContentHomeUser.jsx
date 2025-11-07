import React, { useState, useEffect } from 'react'

// --- Simulamos un hook de temporizador para la oferta del día ---
const useCountdown = (targetDate) => {
  const countDownDate = new Date(targetDate).getTime()
  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [countDownDate])

  return getReturnValues(countDown)
}

const getReturnValues = (countDown) => {
  // Calcula tiempo restante
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000)

  return [hours, minutes, seconds]
}

// --- Datos de ejemplo adaptados ---
const categories = [
  {
    name: 'Refrigeración',
    description: 'Neveras y congeladores de última tecnología.',
    href: '/category/refrigeracion'
  },
  {
    name: 'Lavado & Secado',
    description: 'Soluciones eficientes para el cuidado de tu ropa.',
    href: '/category/lavado'
  },
  {
    name: 'Cocina Profesional',
    description: 'Hornos, encimeras y campanas extractoras.',
    href: '/category/cocina'
  }
]

const featuredProducts = [
  {
    id: 101,
    name: 'Refrigerador Inverter X3000',
    price: '$999',
    oldPrice: '$1199',
    brand: 'Electra'
  },
  {
    id: 102,
    name: 'Centro de Lavado Inteligente',
    price: '$549',
    oldPrice: '$650',
    brand: 'CleanMax'
  },
  {
    id: 103,
    name: 'Horno de Convección Serie 7',
    price: '$780',
    oldPrice: '$890',
    brand: 'GourmetPro'
  },
  {
    id: 104,
    name: 'Smart TV OLED 75" Zero Frame',
    price: '$1999',
    oldPrice: '$2400',
    brand: 'VisionStream'
  }
]

// La oferta del día dura 24 horas a partir de ahora (simulación)
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

const HomePage = () => {
  // Uso del temporizador simulado
  const [hours, minutes, seconds] = useCountdown(tomorrow)

  // Componente del contador para renderizar el tiempo
  const CountdownDisplay = ({ value, label }) => (
    <div className='text-center'>
      <div className='text-3xl font-extrabold text-white bg-gray-900 p-2 rounded-lg leading-none'>
        {String(value).padStart(2, '0')}
      </div>
      <span className='text-xs font-medium text-gray-500 mt-1 block uppercase'>
        {label}
      </span>
    </div>
  )

  return (
    <div className='min-h-screen bg-white'>
      <main>
        {/* --- 1. Hero Section (Banner Principal) --- */}
        <section className='relative bg-gray-900 h-[70vh] flex items-center justify-start overflow-hidden border-b-4 border-teal-400'>
          {/* Contenedor de la imagen a la derecha (simulación) */}
          <div
            className='absolute inset-0 left-1/2 bg-cover bg-center'
            style={{
              backgroundImage:
                "url('ruta/a/imagen/electrodomestico-premium.jpg')"
            }}
          >
            {/*  */}
          </div>

          <div className='relative max-w-7xl mx-auto px-8 w-1/2 min-w-[50%]'>
            <h1 className='text-6xl md:text-8xl font-extrabold tracking-tight mb-4 text-white'>
              <span className='text-teal-400'>DISEÑO</span> Y
              <br />
              RENDIMIENTO
            </h1>
            <p className='text-xl font-light mb-10 opacity-80 text-gray-300 max-w-lg'>
              Una colección curada de electrodomésticos de alto nivel para el
              hogar contemporáneo.
            </p>
            <a
              href='/new-collection'
              className='bg-teal-400 text-gray-900 font-extrabold py-3 px-10 rounded-lg shadow-xl hover:bg-teal-300 transition duration-300 transform hover:translate-y-[-2px] uppercase tracking-wider text-base'
            >
              Ver Colección Premium
            </a>
          </div>
        </section>

        {/* --- 2. Sección de Oferta del Día con Temporizador --- */}
        {hours > 0 || minutes > 0 || seconds > 0 ? (
          <section className='bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500'>
              <div className='text-center md:text-left mb-6 md:mb-0'>
                <p className='text-sm font-semibold text-red-600 uppercase mb-1'>
                  Oferta Exclusiva
                </p>
                <h2 className='text-3xl font-bold text-gray-900'>
                  Precio Flash: Refrigerador X3000
                </h2>
                <p className='text-xl mt-2 font-medium text-gray-600'>
                  <span className='line-through text-gray-400 mr-2'>$1199</span>
                  <span className='text-red-600 font-extrabold'>$999</span>
                </p>
              </div>
              <div className='flex items-center space-x-6'>
                <div className='flex space-x-3'>
                  <CountdownDisplay value={hours} label='Hrs' />
                  <CountdownDisplay value={minutes} label='Min' />
                  <CountdownDisplay value={seconds} label='Seg' />
                </div>
                <a
                  href='/product/101'
                  className='bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 text-base shadow-md'
                >
                  ¡Comprar Ahora!
                </a>
              </div>
            </div>
          </section>
        ) : null}

        {/* --- 3. Exploración por Categoría (Tarjetas con Hover) --- */}
        <section
          className={`py-20 px-4 sm:px-6 lg:px-8 ${hours > 0 ? '' : 'mt-12'}`}
        >
          <h2 className='text-4xl font-extrabold text-gray-900 text-center mb-16 tracking-tight'>
            Explorar por Departamento
          </h2>

          <div className='max-w-7xl mx-auto grid grid-cols-1 gap-10 md:grid-cols-3'>
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className='group relative rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-500 transform hover:-translate-y-1'
              >
                {/* Simulación de Imagen con placeholder limpio */}
                <div className='h-72 w-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg'>
                  [Image for {category.name}]
                </div>

                {/* Overlay minimalista */}
                <div className='absolute inset-0 bg-gray-900 bg-opacity-30 group-hover:bg-opacity-70 transition duration-500 flex flex-col justify-end p-6'>
                  <h3 className='text-2xl font-bold text-white mb-1 tracking-tight'>
                    {category.name}
                  </h3>
                  <p className='text-sm text-gray-200 opacity-80'>
                    {category.description}
                  </p>
                  <span className='mt-2 text-teal-400 text-sm font-semibold transition duration-500 opacity-0 group-hover:opacity-100'>
                    Ver Gama Completa &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* --- 4. Sección de Productos Destacados (Mini-Grid) --- */}
        <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-b border-gray-200'>
          <h2 className='text-4xl font-extrabold text-gray-900 text-center mb-12 tracking-tight'>
            Selección Premium
          </h2>

          <div className='max-w-7xl mx-auto grid grid-cols-2 gap-8 md:grid-cols-4'>
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className='bg-white rounded-lg shadow-sm hover:shadow-lg transition duration-300 overflow-hidden'
              >
                <a href={`/product/${product.id}`}>
                  <div className='h-40 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs p-3'>
                    [Image of {product.name}]
                  </div>
                  <div className='p-4 text-center'>
                    <p className='text-xs font-semibold text-gray-500 uppercase'>
                      {product.brand}
                    </p>
                    <h3 className='text-md font-bold text-gray-800 mt-1 truncate'>
                      {product.name}
                    </h3>
                    <p className='mt-2 text-sm line-through text-gray-400'>
                      {product.oldPrice}
                    </p>
                    <p className='text-xl font-extrabold text-gray-900'>
                      {product.price}
                    </p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* --- 5. Banner de Confianza y Calidad --- */}
        <section className='bg-gray-900 py-16'>
          <div className='max-w-5xl mx-auto text-center px-4'>
            <h3 className='text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight'>
              Garantía de Dos Años en Toda la Gama
            </h3>
            <p className='text-gray-400 mb-8 text-lg font-light'>
              Comprometidos con la durabilidad. Descubre nuestros términos de
              soporte técnico y servicio post-venta.
            </p>
            <a
              href='/support'
              className='border-2 border-teal-400 text-teal-400 font-bold py-3 px-10 rounded-lg hover:bg-teal-400 hover:text-gray-900 transition duration-300 text-base uppercase'
            >
              Centro de Soporte
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
