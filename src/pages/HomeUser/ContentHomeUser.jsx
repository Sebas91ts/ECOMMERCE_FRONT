import { useState, useEffect } from 'react'
import {
  Search,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  ArrowRight
} from 'lucide-react'
import {
  getCategoriasActivas,
  getMarcasActivas,
  getSubcategoriasActivas,
  buscarProductos
} from '../../api/productos/productoService'
import { useApi } from '../../hooks/useApi'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [productosDestacados, setProductosDestacados] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [selectedMarca, setSelectedMarca] = useState('')

  const { execute: fetchCategorias, loading: loadingCategorias } =
    useApi(getCategoriasActivas)
  const { execute: fetchMarcas, loading: loadingMarcas } =
    useApi(getMarcasActivas)
  const { execute: fetchProductos, loading: loadingProductos } =
    useApi(buscarProductos)

  // Cargar datos iniciales
  useEffect(() => {
    loadCategorias()
    loadMarcas()
    loadProductosDestacados()
  }, [])

  const loadCategorias = async () => {
    try {
      const response = await fetchCategorias()
      if (response?.data?.values?.categorias) {
        setCategorias(response.data.values.categorias)
      }
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }

  const loadMarcas = async () => {
    try {
      const response = await fetchMarcas()
      if (response?.data?.values?.marcas) {
        setMarcas(response.data.values.marcas)
      }
    } catch (error) {
      console.error('Error cargando marcas:', error)
    }
  }

  const loadProductosDestacados = async () => {
    try {
      const response = await fetchProductos({
        page_size: 8,
        en_stock: 'true'
      })
      if (response?.data?.values?.productos) {
        setProductosDestacados(response.data.values.productos)
      }
    } catch (error) {
      console.error('Error cargando productos destacados:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()

    // Construir URL con parámetros
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategoria) params.set('categoria', selectedCategoria)
    if (selectedMarca) params.set('marca', selectedMarca)

    navigate(`/catalogo?${params.toString()}`)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      <section className='bg-gradient-to-r from-blue-600 to-purple-700 text-white'>
        <div className='container mx-auto px-4 py-16'>
          <div className='max-w-4xl mx-auto text-center'>
            <h1 className='text-5xl font-bold mb-6'>
              Bienvenido a <span className='text-yellow-300'>SmartSales</span>
            </h1>
            <p className='text-xl mb-8 opacity-90'>
              Los mejores electrodomésticos para tu hogar con precios increíbles
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className='bg-white rounded-lg p-2 shadow-lg'
            >
              <div className='flex flex-col md:flex-row gap-2'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <input
                      type='text'
                      placeholder='¿Qué electrodoméstico estás buscando?'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full pl-10 pr-4 py-3 text-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className='px-4 py-3 text-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todas las categorías</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMarca}
                  onChange={(e) => setSelectedMarca(e.target.value)}
                  className='px-4 py-3 text-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todas las marcas</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>

                <button
                  type='submit'
                  className='bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center'
                >
                  <Search className='w-5 h-5 mr-2' />
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-12 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Truck className='w-8 h-8 text-blue-600' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Envío Gratis</h3>
              <p className='text-gray-600'>
                En compras mayores a Bs 1000 en toda la ciudad
              </p>
            </div>

            <div className='text-center'>
              <div className='bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Shield className='w-8 h-8 text-green-600' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Garantía Extendida</h3>
              <p className='text-gray-600'>
                Hasta 24 meses de garantía en todos nuestros productos
              </p>
            </div>

            <div className='text-center'>
              <div className='bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Star className='w-8 h-8 text-purple-600' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Calidad Premium</h3>
              <p className='text-gray-600'>
                Productos de las mejores marcas del mercado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className='text-3xl font-bold text-gray-900'>
              Categorías Populares
            </h2>
            <button
              onClick={() => navigate('/home/catalogo')}
              className='text-blue-600 hover:text-blue-700 font-semibold flex items-center'
            >
              Ver todos <ArrowRight className='w-4 h-4 ml-1' />
            </button>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6'>
            {loadingCategorias
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className='bg-white rounded-lg shadow-sm p-6 animate-pulse'
                  >
                    <div className='bg-gray-200 h-12 w-12 rounded-lg mx-auto mb-3'></div>
                    <div className='bg-gray-200 h-4 rounded w-3/4 mx-auto'></div>
                  </div>
                ))
              : categorias.slice(0, 6).map((categoria) => (
                  <div
                    key={categoria.id}
                    className='bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow cursor-pointer'
                  >
                    <div className='bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3'>
                      <span className='text-blue-600 font-bold text-lg'>
                        {categoria.nombre.charAt(0)}
                      </span>
                    </div>
                    <h3 className='font-semibold text-gray-800'>
                      {categoria.nombre}
                    </h3>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className='text-3xl font-bold text-gray-900'>
              Productos Destacados
            </h2>
            <button
              onClick={() => navigate('/home/catalogo?en_stock=true')}
              className='text-blue-600 hover:text-blue-700 font-semibold flex items-center'
            >
              Ver todos <ArrowRight className='w-4 h-4 ml-1' />
            </button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {loadingProductos
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className='bg-white rounded-lg shadow-sm border animate-pulse'
                  >
                    <div className='bg-gray-200 h-48 rounded-t-lg'></div>
                    <div className='p-4'>
                      <div className='bg-gray-200 h-4 rounded w-3/4 mb-2'></div>
                      <div className='bg-gray-200 h-4 rounded w-1/2 mb-3'></div>
                      <div className='bg-gray-200 h-6 rounded w-1/3'></div>
                    </div>
                  </div>
                ))
              : productosDestacados.map((producto) => (
                  <div
                    key={producto.id}
                    className='bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow'
                  >
                    <div className='h-48 bg-gray-100 rounded-t-lg flex items-center justify-center'>
                      {producto.imagenes?.[0] ? (
                        <img
                          src={producto.imagenes[0].url_imagen}
                          alt={producto.nombre}
                          className='h-full w-full object-cover rounded-t-lg'
                        />
                      ) : (
                        <div className='text-gray-400 text-center'>
                          <ShoppingCart className='w-12 h-12 mx-auto mb-2' />
                          <p className='text-sm'>Sin imagen</p>
                        </div>
                      )}
                    </div>

                    <div className='p-4'>
                      <h3 className='font-semibold text-gray-800 mb-2 line-clamp-2'>
                        {producto.nombre}
                      </h3>
                      <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                        {producto.descripcion}
                      </p>

                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-lg font-bold text-blue-600'>
                          {formatPrice(producto.precio_contado)}
                        </span>
                        {producto.precio_cuota && (
                          <span className='text-sm text-gray-500'>
                            12x {formatPrice(producto.precio_cuota)}
                          </span>
                        )}
                      </div>

                      <div className='flex items-center justify-between'>
                        <span
                          className={`text-sm font-medium ${
                            producto.stock > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {producto.stock > 0 ? 'En stock' : 'Sin stock'}
                        </span>
                        <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center'>
                          <ShoppingCart className='w-4 h-4 mr-1' />
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Marcas Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-gray-900 text-center mb-12'>
            Marcas Confiables
          </h2>

          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8'>
            {loadingMarcas
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className='bg-white rounded-lg p-6 animate-pulse'
                  >
                    <div className='bg-gray-200 h-12 rounded w-full'></div>
                  </div>
                ))
              : marcas.slice(0, 12).map((marca) => (
                  <div
                    key={marca.id}
                    className='bg-white rounded-lg p-6 flex items-center justify-center hover:shadow-md transition-shadow'
                  >
                    <span className='text-gray-800 font-semibold text-center'>
                      {marca.nombre}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className='bg-blue-600 text-white py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-4'>
            ¡No te pierdas las ofertas!
          </h2>
          <p className='text-xl mb-8 opacity-90'>
            Suscríbete y recibe las mejores promociones en electrodomésticos
          </p>
          <div className='max-w-md mx-auto flex'>
            <input
              type='email'
              placeholder='Tu correo electrónico'
              className='flex-1 px-4 py-3 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <button className='bg-yellow-400 text-blue-900 px-6 py-3 rounded-r-lg font-semibold hover:bg-yellow-300 transition-colors'>
              Suscribirse
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
