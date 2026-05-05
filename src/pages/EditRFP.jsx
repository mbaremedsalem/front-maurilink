import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { rfpService } from '../api/services';
import { HiArrowLeft, HiPlus, HiX } from 'react-icons/hi';
import { toast } from 'react-toastify';

const EditRFP = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
    attachment: null
  });
  const [criteriaList, setCriteriaList] = useState([]);

  useEffect(() => {
    fetchRFP();
  }, [id]);

  const fetchRFP = async () => {
    try {
      setLoading(true);
      const response = await rfpService.getById(id);
      const data = response.data;
      setFormData({
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        contract_type: data.contract_type,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        submission_deadline: data.submission_deadline?.split('T')[0] || '',
        start_date: data.start_date || '',
        duration: data.duration,
        criteria: data.criteria || {},
        attachment: null
      });
      
      // Convert criteria object to array
      if (data.criteria) {
        const criteriaArray = Object.entries(data.criteria).map(([key, value]) => ({ key, value }));
        setCriteriaList(criteriaArray);
      }
    } catch (error) {
      console.error('Error fetching RFP:', error);
      toast.error('Impossible de charger l\'appel d\'offres');
      navigate('/my-rfps');
    } finally {
      setLoading(false);
    }
  };

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
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const submitData = new FormData();
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
    if (formData.attachment) {
      submitData.append('attachment', formData.attachment);
    }

    try {
      await rfpService.update(id, submitData);
      toast.success('Appel d\'offres mis à jour avec succès !');
      navigate('/my-rfps');
    } catch (error) {
      console.error('Error updating RFP:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5">
            <h1 className="text-2xl font-bold text-white">Modifier l'appel d'offres</h1>
            <p className="text-amber-100 text-sm mt-1">Mettez à jour les informations de votre projet</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Same fields as CreateRFP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation *</label>
                <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
                <select name="contract_type" required value={formData.contract_type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="FREELANCE">Freelance</option>
                  <option value="CDD">CDD</option>
                  <option value="CDI">CDI</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget min (MRU) *</label>
                <input type="number" name="budget_min" required value={formData.budget_min} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget max (MRU) *</label>
                <input type="number" name="budget_max" required value={formData.budget_max} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date limite *</label>
                <input type="date" name="submission_deadline" required value={formData.submission_deadline} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée *</label>
              <input type="text" name="duration" required value={formData.duration} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" required rows="5" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis *</label>
              <textarea name="requirements" required rows="4" value={formData.requirements} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Critères</label>
                <button type="button" onClick={handleAddCriteria} className="inline-flex items-center gap-1 text-blue-600 text-sm">
                  <HiPlus className="w-4 h-4" /> Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {criteriaList.map((criteria, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input type="text" placeholder="Critère" value={criteria.key} onChange={(e) => handleCriteriaChange(idx, 'key', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="text" placeholder="Valeur" value={criteria.value} onChange={(e) => handleCriteriaChange(idx, 'value', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                    <button type="button" onClick={() => handleRemoveCriteria(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><HiX className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau fichier (optionnel)</label>
              <input type="file" onChange={handleFileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-blue-50 file:text-blue-700" />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                {submitting ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
              <button type="button" onClick={() => navigate('/my-rfps')} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">Annuler</button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditRFP;