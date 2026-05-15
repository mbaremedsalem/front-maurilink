// src/api/axios.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://back.maurilink.site/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si c'est un FormData, laisser le navigateur gérer le Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Fonction pour extraire le message d'erreur de la réponse du backend
const getErrorMessage = (error) => {
  // Pas de réponse du serveur
  if (!error.response) {
    return '🌐 Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
  }

  const { data, status } = error.response;

  // Cas 1: Le backend retourne un message simple (string)
  if (typeof data === 'string') {
    return data;
  }

  // Cas 2: Le backend retourne un tableau d'erreurs
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }

  // Cas 3: Le backend retourne un objet avec 'detail' (DRF)
  if (data.detail) {
    return data.detail;
  }

  // Cas 4: Le backend retourne un objet avec 'message'
  if (data.message) {
    return data.message;
  }

  // Cas 5: Le backend retourne une erreur de validation de champ
  if (data.non_field_errors) {
    return data.non_field_errors[0];
  }

  // Cas 6: Parcourir les champs pour trouver la première erreur
  for (const key in data) {
    if (Array.isArray(data[key]) && data[key].length > 0) {
      return data[key][0];
    }
    if (typeof data[key] === 'string') {
      return data[key];
    }
  }

  // Message par défaut selon le code HTTP
  const statusMessages = {
    400: '❌ Requête invalide. Vérifiez les données envoyées.',
    401: '🔒 Non autorisé. Veuillez vous reconnecter.',
    403: '⛔ Accès interdit. Vous n\'avez pas les permissions nécessaires.',
    404: '🔍 Ressource non trouvée.',
    409: '⚠️ Conflit. Cette ressource existe déjà.',
    500: '💥 Erreur interne du serveur. Veuillez réessayer plus tard.',
  };

  return statusMessages[status] || '❓ Une erreur est survenue. Veuillez réessayer.';
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Gestion du refresh token (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Extraire et afficher le message d'erreur retourné par le backend
    const errorMessage = getErrorMessage(error);
    
    // Afficher le toast avec le message exact du backend
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    return Promise.reject(error);
  }
);

export default api;