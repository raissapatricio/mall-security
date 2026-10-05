import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // Essencial para envio e recebimento dos cookies httpOnly
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de resposta para tratamento consistente de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    const message = errorData?.error || errorData?.message || 'Erro de comunicação com o servidor de defesa.';
    return Promise.reject({
      message,
      status: error.response?.status,
      code: errorData?.code,
      details: errorData?.details
    });
  }
);
