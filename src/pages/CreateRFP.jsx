import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { rfpService } from '../api/services';
import { 
  HiArrowLeft, 
  HiPlus, 
  HiX,
  HiUpload,
  HiInformationCircle,
  HiCalendar,
  HiCurrencyDollar,
  HiLocationMarker,
  HiBriefcase,
  HiDocumentText
} from 'react-icons/hi';
import { toast } from 'react-toastify';

const CreateRFP = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_id: '',
    title: '',
    description: '',
    requirements: '',
    location: '',
    contract_type: 'FREELANCE',
    budget_min: '',
    budget_max: '',
    submission_deadline: '',
    start_date: '',
    duration: '',
    criteria: {},
    status: 'open'
  });
  const [criteriaList, setCriteriaList] = useState([]);
  const [attachment, setAttachment] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCriteria = () => {
    setCriteriaList([...criteriaList, { key: '', value: '' }]);
  };

  const handleCriteriaChange = (index, field, value) => {
    const updated = [...criteriaList];
    updated[index][field] = value;
    setCriteriaList(updated);
    
    // Update criteria object
    const criteriaObj = {};
    updated.forEach(c => {
      if (c.key && c.value) criteriaObj[c.key] = c.value;
    });
    setFormData(prev => ({ ...prev, criteria: criteriaObj }));
  };

  const handleRemoveCriteria = (index) => {
    const updated = criteriaList.filter((_, i) => i !== index);
    setCriteriaList(updated);
    const criteriaObj = {};
    updated.forEach(c => {
      if (c.key && c.value) criteriaObj[c.key] = c.value;
    });
    setFormData(prev => ({ ...prev, criteria: criteriaObj }));
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Récupérer l'ID de l'entreprise depuis l'utilisateur connecté
    const companyId = user?.company_id || user?.company?.id || '';
    
    const submitData = new FormData();
    submitData.append('company_id', companyId);
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('requirements', formData.requirements);
    submitData.append('location', formData.location);
    submitData.append('contract_type', formData.contract_type);
    submitData.append('budget_min', formData.budget_min);
    submitData.append('budget_max', formData.budget_max);
    submitData.append('submission_deadline', formData.submission_deadline);
    submitData.append('start_date', formData.start_date);
    submitData.append('duration', formData.duration);
    submitData.append('criteria', JSON.stringify(formData.criteria));
    submitData.append('status', formData.status);
    if (attachment) {
      submitData.append('attachment', attachment);
    }

    try {
      await rfpService.create(submitData);
      toast.success('Appel d\'offres créé avec succès !');
      navigate('/my-rfps');
    } catch (error) {
      console.error('Error creating RFP:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          'Erreur lors de la création';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/my-rfps" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group">
          <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
            <h1 className="text-2xl font-bold text-white">Créer un appel d'offres</h1>
            <p className="text-blue-100 text-sm mt-1">Publiez un nouveau projet et recevez des propositions</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations de base */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Développement application mobile"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation *</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Paris, Remote"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
                <select
                  name="contract_type"
                  required
                  value={formData.contract_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FREELANCE">Freelance</option>
                  <option value="CDD">CDD</option>
                  <option value="CDI">CDI</option>
                </select>
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget min (MRU) *</label>
                <input
                  type="number"
                  name="budget_min"
                  required
                  value={formData.budget_min}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget max (MRU) *</label>
                <input
                  type="number"
                  name="budget_max"
                  required
                  value={formData.budget_max}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date limite de soumission *</label>
                <input
                  type="datetime-local"
                  name="submission_deadline"
                  required
                  value={formData.submission_deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début prévue</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée *</label>
              <input
                type="text"
                name="duration"
                required
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 3 mois"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                required
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez le projet, les objectifs, les livrables attendus..."
              />
            </div>

            {/* Prérequis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis techniques *</label>
              <textarea
                name="requirements"
                required
                rows="4"
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Listez les compétences, technologies et expériences requises..."
              />
            </div>

            {/* Critères */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Critères d'évaluation</label>
                <button
                  type="button"
                  onClick={handleAddCriteria}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <HiPlus className="w-4 h-4" />
                  Ajouter un critère
                </button>
              </div>
              <div className="space-y-3">
                {criteriaList.map((criteria, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Nom du critère"
                      value={criteria.key}
                      onChange={(e) => handleCriteriaChange(idx, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Valeur"
                      value={criteria.value}
                      onChange={(e) => handleCriteriaChange(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCriteria(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <HiX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fichier joint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document joint (optionnel)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Ouvert</option>
                <option value="closed">Fermé</option>
              </select>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Création en cours...' : 'Publier l\'appel d\'offres'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-rfps')}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRFP;