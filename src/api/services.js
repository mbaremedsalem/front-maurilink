import api from './axios';

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
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


  // Soumettre une proposition pour un appel d'offres
  submitProposal: (data) => api.post('/jobs/proposals/', data),
  
  // Récupérer les propositions de l'entreprise connectée
  getCompanyProposals: () => api.get('/jobs/proposals/company/'),
  
  // Mettre à jour le statut d'une proposition
  updateProposalStatus: (id, data) => api.patch(`/jobs/proposals/${id}/`, data),
};

// Companies Services
export const companyService = {
  getMyRfps: () => api.get('/jobs/rfps/my/'),
  create: (data) => api.post('/companies/create/', data),
  getProfile: () => api.get('/companies/profile/'),
  update: (data) => api.put('/companies/profile/', data),
};

// Jobs Services
export const jobService = {
  getAll: (params) => api.get('/jobs/offers/', { params }),
  getById: (id) => api.get(`/jobs/offers/${id}/`),
  create: (data) => api.post('/jobs/offers/create/', data),
  update: (id, data) => api.put(`/jobs/offers/${id}/`, data),
  delete: (id) => api.delete(`/jobs/offers/${id}/`),
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
  apply: (data) => api.post('/applications/apply/', data),
  getMyApplications: () => api.get('/applications/my-applications/'),
  getCompanyApplications: () => api.get('/applications/company-applications/'),
  updateStatus: (id, data) => api.put(`/applications/applications/${id}/update-status/`, data),
};

// Advertising Services
export const advertisingService = {
  getAll: () => api.get('/advertising/ads/'),
  create: (data) => api.post('/advertising/ads/', data),
  trackView: (id) => api.post(`/advertising/ads/${id}/track/view/`),
  trackClick: (id) => api.post(`/advertising/ads/${id}/track/click/`),
};



