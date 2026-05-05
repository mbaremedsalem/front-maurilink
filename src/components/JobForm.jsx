import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  HiX, 
  HiBriefcase, 
  HiLocationMarker, 
  HiCurrencyDollar, 
  HiDocumentText, 
  HiClock, 
  HiUserGroup, 
  HiCheckCircle, 
  HiAcademicCap, 
  HiCode, 
  HiOfficeBuilding, 
  HiStar 
} from 'react-icons/hi';

const JobForm = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [newJob, setNewJob] = useState(
    initialData || {
      title: '',
      description: '',
      location: '',
      contract_type: 'CDI',
      salary_min: '',
      salary_max: '',
      criteria: {
        experience: '',
        education: '',
        skills: []
      }
    }
  );

  const contractTypes = ['CDI', 'CDD', 'FREELANCE', 'STAGE', 'ALTERNANCE'];
  const locations = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse', 'Nantes', 'Strasbourg', 'Remote'];

  const validateForm = () => {
    const newErrors = {};
    if (!newJob.title.trim()) newErrors.title = 'Le titre est requis';
    if (!newJob.description.trim()) newErrors.description = 'La description est requise';
    if (!newJob.location) newErrors.location = 'La localisation est requise';
    if (!newJob.salary_min) newErrors.salary_min = 'Le salaire minimum est requis';
    if (!newJob.salary_max) newErrors.salary_max = 'Le salaire maximum est requis';
    if (newJob.salary_min && newJob.salary_max && parseFloat(newJob.salary_min) >= parseFloat(newJob.salary_max)) {
      newErrors.salary = 'Le salaire minimum doit être inférieur au salaire maximum';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setNewJob({
      title: '',
      description: '',
      location: '',
      contract_type: 'CDI',
      salary_min: '',
      salary_max: '',
      criteria: {
        experience: '',
        education: '',
        skills: []
      }
    });
    setSkillInput('');
    setErrors({});
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  
  try {
    const jobData = {
      title: newJob.title,
      description: newJob.description,
      criteria: {
        experience: newJob.criteria.experience,
        education: newJob.criteria.education,
        skills: newJob.criteria.skills
      },
      location: newJob.location,
      salary_min: parseFloat(newJob.salary_min),
      salary_max: parseFloat(newJob.salary_max),
      contract_type: newJob.contract_type
    };
    
    let response;
    
    // Si initialData existe (mode édition), on update, sinon on crée
    if (initialData && initialData.id) {
      response = await jobService.update(initialData.id, jobData);
      toast.success('Offre modifiée avec succès !');
    } else {
      response = await jobService.create(jobData);
      toast.success('Offre créée avec succès !');
    }
    
    if (onSuccess) {
      onSuccess(response.data);
    }
    
    resetForm();
    onClose();
  } catch (error) {
    console.error('Error saving job:', error);
    
    if (error.response?.data) {
      const apiErrors = error.response.data;
      
      // Afficher les erreurs champ par champ
      if (typeof apiErrors === 'object') {
        Object.keys(apiErrors).forEach(key => {
          const messages = Array.isArray(apiErrors[key]) 
            ? apiErrors[key].join(', ') 
            : apiErrors[key];
          toast.error(`${key}: ${messages}`);
        });
      }
    } else {
      toast.error('Erreur de connexion au serveur');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const handleAddSkill = () => {
    if (skillInput.trim() && !newJob.criteria.skills.includes(skillInput.trim())) {
      setNewJob({
        ...newJob,
        criteria: {
          ...newJob.criteria,
          skills: [...newJob.criteria.skills, skillInput.trim()]
        }
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setNewJob({
      ...newJob,
      criteria: {
        ...newJob.criteria,
        skills: newJob.criteria.skills.filter(skill => skill !== skillToRemove)
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCriteriaChange = (field, value) => {
    setNewJob({
      ...newJob,
      criteria: { ...newJob.criteria, [field]: value }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <HiOfficeBuilding className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">
                      {initialData ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}
                    </h2>
                  </div>
                  <p className="text-blue-100">
                    {initialData ? 'Modifiez les informations de votre offre' : 'Publiez une offre d\'emploi pour trouver les meilleurs talents'}
                  </p>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Section 1: Informations générales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                  <HiStar className="w-5 h-5 text-blue-600" />
                  Informations générales
                </h3>

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiBriefcase className="inline w-4 h-4 mr-1 text-blue-600" />
                    Titre du poste <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={newJob.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Développeur Full Stack Senior"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiDocumentText className="inline w-4 h-4 mr-1 text-blue-600" />
                    Description du poste <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="5"
                    value={newJob.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez les missions, responsabilités et conditions du poste..."
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${
                      errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                </div>
              </div>

              {/* Section 2: Détails du poste */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                  <HiOfficeBuilding className="w-5 h-5 text-blue-600" />
                  Détails du poste
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Localisation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiLocationMarker className="inline w-4 h-4 mr-1 text-blue-600" />
                      Localisation <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="location"
                      required
                      value={newJob.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">Sélectionnez une ville</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
                  </div>

                  {/* Type de contrat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiBriefcase className="inline w-4 h-4 mr-1 text-blue-600" />
                      Type de contrat <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="contract_type"
                      required
                      value={newJob.contract_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                    >
                      {contractTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiCurrencyDollar className="inline w-4 h-4 mr-1 text-blue-600" />
                      Salaire minimum (MRU) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="salary_min"
                      required
                      value={newJob.salary_min}
                      onChange={handleInputChange}
                      placeholder="Ex: 35000"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.salary_min ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiCurrencyDollar className="inline w-4 h-4 mr-1 text-blue-600" />
                      Salaire maximum (MRU) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="salary_max"
                      required
                      value={newJob.salary_max}
                      onChange={handleInputChange}
                      placeholder="Ex: 55000"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.salary_max ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  </div>
                </div>
                {errors.salary && <p className="mt-1 text-xs text-red-500">{errors.salary}</p>}
              </div>

              {/* Section 3: Critères de sélection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                  <HiUserGroup className="w-5 h-5 text-blue-600" />
                  Critères de sélection
                </h3>

                {/* Expérience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiClock className="inline w-4 h-4 mr-1 text-blue-600" />
                    Expérience requise
                  </label>
                  <select
                    value={newJob.criteria.experience}
                    onChange={(e) => handleCriteriaChange('experience', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                  >
                    <option value="">Sélectionnez l'expérience</option>
                    <option value="0-1 an">0-1 an</option>
                    <option value="1-2 ans">1-2 ans</option>
                    <option value="2-3 ans">2-3 ans</option>
                    <option value="3-5 ans">3-5 ans</option>
                    <option value="5+ ans">5+ ans</option>
                  </select>
                </div>

                {/* Niveau d'études */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiAcademicCap className="inline w-4 h-4 mr-1 text-blue-600" />
                    Niveau d'études
                  </label>
                  <select
                    value={newJob.criteria.education}
                    onChange={(e) => handleCriteriaChange('education', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                  >
                    <option value="">Sélectionnez le niveau</option>
                    <option value="Bac">Bac</option>
                    <option value="Bac+2">Bac+2</option>
                    <option value="Bac+3">Bac+3</option>
                    <option value="Bac+5">Bac+5</option>
                    <option value="Bac+8">Bac+8</option>
                  </select>
                </div>

                {/* Compétences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiCode className="inline w-4 h-4 mr-1 text-blue-600" />
                    Compétences requises
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Ex: React, Python, Django..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newJob.criteria.skills.map((skill, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                      >
                        <HiCode className="w-3.5 h-3.5" />
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-blue-900 transition-colors"
                        >
                          <HiX className="w-3.5 h-3.5" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white py-4 -mb-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Publication en cours...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <HiCheckCircle className="w-5 h-5" />
                      Publier l'offre
                    </div>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobForm;