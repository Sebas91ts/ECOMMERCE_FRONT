import instancia from '../axios';

export const agregarProductoCarrito = async (productoData) => {
    return instancia.post('venta/agregar_producto_carrito', productoData);
}

export const vaciarCarrito = async () => {
    return instancia.post('venta/vaciar_carrito');
}

export const eliminarProductoCarrito = async (productoId) => {
    return instancia.post('venta/eliminar_producto_carrito', { producto_id: productoId });
}

export const generarPedido = async (pedidoData) => {
    return instancia.post('venta/generar_pedido', pedidoData);
}

export const obtenerMiCarrito = async () => {
    return instancia.get('venta/obtener_mi_carrito');
}