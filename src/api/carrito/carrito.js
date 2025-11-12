import instancia from '../axios';

export const agregarProductoCarrito = async (productoData) => {
    return instancia.post('venta/agregar_producto_carrito', productoData);
}

export const vaciarCarrito = async () => {
    return instancia.delete('venta/vaciar_carrito');
}

export const eliminarProductoCarrito = async (data) => {
    return instancia.patch('venta/eliminar_producto_carrito', data);
}

export const generarPedido = async (pedidoData) => {
    return instancia.post('venta/generar_pedido', pedidoData);
}

export const obtenerMiCarrito = async () => {
    return instancia.get('venta/obtener_mi_carrito');
}

export const listarFormasPagoActivasUsuario = async () => {
    return instancia.get('venta/listar_formas_pago_activas_usuario');
}