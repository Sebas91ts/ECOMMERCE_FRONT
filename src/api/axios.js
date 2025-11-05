//src/api/axios.js
import axios from "axios";

// Crear instancia de Axios
const instancia = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/',
});

// Interceptor para agregar el token a cada petición
instancia.interceptors.request.use((config) => {
  // Obtener token del localStorage
  const authData = JSON.parse(localStorage.getItem("authData"));
  const token = authData?.accessToken;

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instancia;
