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
  HiStar,
  HiPaperClip
} from 'react-icons/hi';

const JobForm = ({ isOpen, onClose, onSuccess, initialData = null, refreshJobs }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  
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

  const getToken = () => {
    return localStorage.getItem('access_token');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newJob.title.trim()) newErrors.title = 'Le titre est requis';
    if (!newJob.description.trim()) newErrors.description = 'La description est requise';
    if (!newJob.location) newErrors.location = 'La localisation est requise';
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
    setSelectedFile(null);
    setErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        toast.error('Seuls les fichiers PDF sont acceptés');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', newJob.title);
      formData.append('description', newJob.description);
      formData.append('location', newJob.location);
      formData.append('contract_type', newJob.contract_type);
      
      if (newJob.salary_min && newJob.salary_min !== '') {
        formData.append('salary_min', newJob.salary_min);
      }
      if (newJob.salary_max && newJob.salary_max !== '') {
        formData.append('salary_max', newJob.salary_max);
      }
      
      // CORRECTION: Construire l'objet criteria exactement comme dans le curl
      const criteriaObj = {};
      
      // Ajouter l'expérience si présente
      if (newJob.criteria.experience && newJob.criteria.experience !== '') {
        criteriaObj.experience = newJob.criteria.experience;
      }
      
      // Ajouter l'éducation si présente
      if (newJob.criteria.education && newJob.criteria.education !== '') {
        criteriaObj.education = newJob.criteria.education;
      }
      
      // Ajouter les skills (technologies)
      if (newJob.criteria.skills && newJob.criteria.skills.length > 0) {
        criteriaObj.skills = newJob.criteria.skills;
      } else {
        criteriaObj.skills = [];
      }
      
      // Stringifier l'objet criteria
      formData.append('criteria', JSON.stringify(criteriaObj));
      
      // Ajouter le fichier
      if (selectedFile) {
        formData.append('job_description_file', selectedFile);
      }
      
      const token = getToken();
      const url = initialData && initialData.id 
        ? `http://127.0.0.1:8000/api/jobs/offers/${initialData.id}/`
        : 'http://127.0.0.1:8000/api/jobs/offers/';
      
      const response = await fetch(url, {
        method: initialData && initialData.id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erreur API:', data);
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(key => {
            const messages = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
            toast.error(`${key}: ${messages}`);
          });
        }
        throw new Error(JSON.stringify(data));
      }
      
      toast.success(initialData ? 'Offre modifiée avec succès !' : 'Offre créée avec succès !');
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      if (refreshJobs) {
        refreshJobs();
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Erreur lors de la sauvegarde');
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
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl">
                  <HiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations générales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                  <HiStar className="w-5 h-5 text-blue-600" />
                  Informations générales
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiBriefcase className="inline w-4 h-4 mr-1 text-blue-600" />
                    Titre du poste <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newJob.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Développeur Full Stack Senior"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiDocumentText className="inline w-4 h-4 mr-1 text-blue-600" />
                    Description du poste <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="5"
                    value={newJob.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez les missions, l'environnement technique..."
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                </div>
              </div>

              {/* Détails du poste */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                  <HiOfficeBuilding className="w-5 h-5 text-blue-600" />
                  Détails du poste
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiLocationMarker className="inline w-4 h-4 mr-1 text-blue-600" />
                      Localisation <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="location"
                      value={newJob.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionnez une ville</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiBriefcase className="inline w-4 h-4 mr-1 text-blue-600" />
                      Type de contrat
                    </label>
                    <select
                      name="contract_type"
                      value={newJob.contract_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    >
                      {contractTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiCurrencyDollar className="inline w-4 h-4 mr-1 text-blue-600" />
                      Salaire minimum (Optionnel)
                    </label>
                    <input
                      type="text"
                      name="salary_min"
                      value={newJob.salary_min}
                      onChange={handleInputChange}
                      placeholder="Ex: 45000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiCurrencyDollar className="inline w-4 h-4 mr-1 text-blue-600" />
                      Salaire maximum (Optionnel)
                    </label>
                    <input
                      type="text"
                      name="salary_max"
                      value={newJob.salary_max}
                      onChange={handleInputChange}
                      placeholder="Ex: 60000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Compétences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                  <HiCode className="w-5 h-5 text-blue-600" />
                  Compétences requises
                </h3>

                <div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Ex: React, Python, Django, Product management..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg"
                    >
                      Ajouter
                    </button>
                  </div>
                  
                  {newJob.criteria.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newJob.criteria.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-blue-900"
                          >
                            <HiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiClock className="inline w-4 h-4 mr-1 text-blue-600" />
                    Expérience requise
                  </label>
                  <select
                    value={newJob.criteria.experience}
                    onChange={(e) => handleCriteriaChange('experience', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionnez l'expérience</option>
                    <option value="0-1 an">0-1 an</option>
                    <option value="1-2 ans">1-2 ans</option>
                    <option value="2-3 ans">2-3 ans</option>
                    <option value="3-5 ans">3-5 ans</option>
                    <option value="4-6 ans">4-6 ans</option>
                    <option value="5-7 ans">5-7 ans</option>
                    <option value="5+ ans">5+ ans</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiAcademicCap className="inline w-4 h-4 mr-1 text-blue-600" />
                    Niveau d'études
                  </label>
                  <select
                    value={newJob.criteria.education}
                    onChange={(e) => handleCriteriaChange('education', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionnez le niveau</option>
                    <option value="Bac">Bac</option>
                    <option value="Bac+2">Bac+2</option>
                    <option value="Bac+3">Bac+3</option>
                    <option value="Bac+4">Bac+4</option>
                    <option value="Bac+5">Bac+5</option>
                    <option value="Bac+8">Bac+8</option>
                    <option value="Master en Marketing Digital ou Management">Master Marketing Digital</option>
                  </select>
                </div>
              </div>

              {/* Fichier PDF */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b">
                  <HiPaperClip className="w-5 h-5 text-blue-600" />
                  Fichier PDF (Optionnel)
                </h3>

                <div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Publication en cours...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <HiCheckCircle className="w-5 h-5" />
                      {initialData ? 'Modifier l\'offre' : 'Publier l\'offre'}
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