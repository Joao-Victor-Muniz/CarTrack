import axios from 'axios';

// Instância do Axios apontando para o seu Mockoon local
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const fetchVeiculos = async () => {
  const response = await api.get('/veiculos');
  return response.data;
};

export const fetchVeiculoDetalhes = async (id) => {
  const response = await api.get(`/veiculos/${id}`);
  return response.data;
};

export default api;
