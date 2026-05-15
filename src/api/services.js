import api from './axios';
import { decodeId, encodeId } from '../utils/hashIds';

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};

// Password Reset Services (AJOUTEZ CE CI)
export const passwordService = {
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
};


// RFP (Appel d'offres) Services
export const rfpService = {
  // Récupérer tous les appels d'offres
  getAll: (params) => api.get('/jobs/rfps/', { params }),
  
  // Récupérer un appel d'offres spécifique
  getById: (id) => api.get(`/jobs/rfps/${id}/`),
  
  // Récupérer les appels d'offres de l'entreprise connectée
  getMyRfps: () => api.get('/jobs/rfps/my/'),
  
  // Créer un appel d'offres
  create: (data) => api.post('/jobs/rfps/', data),
  
  // Mettre à jour un appel d'offres
  update: (id, data) => api.put(`/jobs/rfps/${id}/`, data),
  
  // Supprimer un appel d'offres
  delete: (id) => api.delete(`/jobs/rfps/${id}/`),
  
  // Soumettre une proposition pour un appel d'offres
  submitProposal: (id, data) => api.post(`/jobs/rfps/${id}/proposals/`, data),
  
  // Récupérer les propositions pour un appel d'offres
  getProposals: (id) => api.get(`/jobs/rfps/${id}/proposals/`),


  submitProposal: (data) => {

    return api.post('/jobs/proposals/', data);
  },
  
  // Récupérer les propositions de l'entreprise connectée
  getCompanyProposals: () => api.get('/jobs/proposals/company/'),
  
  // Mettre à jour le statut d'une proposition
  updateProposalStatus: (id, data) => api.patch(`/jobs/proposals/${id}/`, data),
};

// Companies Services
export const companyService = {
  getMyRfps: () => api.get('/jobs/rfps/my/'),
    create: (data) => {
    // Si c'est un FormData, laissez axios gérer automatiquement
    if (data instanceof FormData) {
      return api.post('/companies/create-company/', data);
    }
    // Sinon, envoyez en JSON
    return api.post('/companies/create-company/', data);
  },
  getProfile: () => api.get('/companies/my-company/'),
  update: (data) => {
    if (data instanceof FormData) {
      return api.put('/companies/my-company/', data);
    }
    return api.put('/companies/my-company/', data);
  },

};

// // Jobs Services
// export const jobService = {
//   getAll: (params) => api.get('/jobs/offers/', { params }),
//   getById: (id) => api.get(`/jobs/offers/${id}/`),
//   create: (data) => api.post('/jobs/offers/', data),
//   update: (id, data) => api.put(`/jobs/offers/${id}/`, data),
//   delete: (id) => api.delete(`/jobs/offers/${id}/`),
// };


// Jobs Services avec support des IDs hashés
export const jobService = {
  // Récupérer tous les jobs (inchangé)
  getAll: (params) => api.get('/jobs/offers/', { params }),
  
  // Récupérer un job par ID (supporte maintenant les IDs hashés ET numériques)
  getById: (idOrHashed) => {
    // Essayer de décoder si c'est un hash, sinon utiliser l'ID directement
    const decodedId = decodeId(idOrHashed);
    const realId = decodedId || idOrHashed;
    
    if (!realId) {
      return Promise.reject(new Error('Invalid job ID'));
    }
    
    return api.get(`/jobs/offers/${realId}/`);
  },
  
  // Créer un job (inchangé)
  create: (data) => api.post('/jobs/offers/', data),
  
  // Mettre à jour un job (supporte les IDs hashés)
  update: (idOrHashed, data) => {
    const decodedId = decodeId(idOrHashed);
    const realId = decodedId || idOrHashed;
    return api.put(`/jobs/offers/${realId}/`, data);
  },
  
  // Supprimer un job (supporte les IDs hashés)
  delete: (idOrHashed) => {
    const decodedId = decodeId(idOrHashed);
    const realId = decodedId || idOrHashed;
    return api.delete(`/jobs/offers/${realId}/`);
  },
  
  // NOUVEAU: Obtenir l'URL hashée pour un job
  getHashedUrl: (realId) => {
    return `/jobs/${encodeId(realId)}`;
  },
  
  // NOUVEAU: Vérifier si un ID est valide
  isValidId: (idOrHashed) => {
    const decodedId = decodeId(idOrHashed);
    return decodedId !== null || (typeof idOrHashed === 'number' && idOrHashed > 0);
  }
};

// Resumes Services
export const resumeService = {
  getAll: () => api.get('/resumes/resumes/'),
  getById: (id) => api.get(`/resumes/resumes/${id}/`),
  create: (data) => api.post('/resumes/resumes/', data),
  update: (id, data) => api.put(`/resumes/resumes/${id}/`, data),
  delete: (id) => api.delete(`/resumes/resumes/${id}/`),
  setDefault: (id) => api.post(`/resumes/resumes/${id}/set-default/`),
};

// Applications Services

// Dans applicationService.js
export const applicationService = {
  // Méthode pour utilisateur connecté (JSON avec token)
  apply: (data) => api.post('/applications/apply/', data),
  
  // NOUVELLE MÉTHODE pour utilisateur non connecté (FormData avec fichier)
  applyAsGuest: (formData) => api.post('/applications/apply/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  getMyApplications: () => api.get('/applications/my-applications/'),
  getCompanyApplications: () => api.get('/applications/company-applications/'),
  updateStatus: (id, data) => api.put(`/applications/applications/${id}/update-status/`, data),
};

// export const applicationService = {
//   apply: (data) => api.post('/applications/apply/', data),
//   getMyApplications: () => api.get('/applications/my-applications/'),
//   getCompanyApplications: () => api.get('/applications/company-applications/'),
//   updateStatus: (id, data) => api.put(`/applications/applications/${id}/update-status/`, data),
// };

// Advertising Services
export const advertisingService = {
  getAll: () => api.get('/advertising/ads/'),
  create: (data) => api.post('/advertising/ads/', data),
  trackView: (id) => api.post(`/advertising/ads/${id}/track/view/`),
  trackClick: (id) => api.post(`/advertising/ads/${id}/track/click/`),
};



