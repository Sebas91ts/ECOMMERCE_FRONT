import instancia from "../axios";

export const crearSesionStripe = async (formaPagoId) => {
    return instancia.post('venta/stripe/crear-sesion', {
        forma_pago: formaPagoId
    });
};

export const confirmarPagoStripe = async (sessionId) => {
    return instancia.get(`venta/stripe/verificar-pago/${sessionId}`);
};


export const crearPaymentIntentStripe = (formaPagoId, monto) => {
  return instancia.post('/venta/stripe/crear-payment-intent', {
    forma_pago: formaPagoId,
    monto: monto  // ← Enviar el monto del carrito
  });
};