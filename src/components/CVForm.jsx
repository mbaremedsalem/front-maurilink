import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiX, HiUser, HiBriefcase, HiAcademicCap, 
  HiTranslate, HiCode, HiChevronRight, HiChevronLeft,
  HiPlus, HiTrash, HiUpload
} from 'react-icons/hi';

const CVForm = ({ resume, onSave, onClose }) => {
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(resume?.photo || null);
  const [showImageOnSite, setShowImageOnSite] = useState(resume?.show_photo !== false);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: resume?.title || '',
    personal_info: resume?.personal_info || {
      civilite: '',
      first_name: '',
      last_name: '',
      phone: '',
      birth_date: '',
      email: '',
      domaine_etude: '',
      niveau_etude: '',
      apropos: '',
      address: '',
      driving_license: false,
    },
    experience: resume?.experience || [],
    education: resume?.education || [],
    languages: resume?.languages || [],
    skills: resume?.skills || [],
  });

  const steps = [
    { number: 1, title: 'Profil', icon: HiUser },
    { number: 2, title: 'Expérience', icon: HiBriefcase },
    { number: 3, title: 'Formation', icon: HiAcademicCap },
    { number: 4, title: 'Langues', icon: HiTranslate },
    { number: 5, title: 'Compétences', icon: HiCode },
  ];

  const civilites = ['Monsieur', 'Madame', 'Mademoiselle'];
  
  const niveauxEtude = [
    'Certificat',
    'Brevet',
    'BAC',
    'BAC+2',
    'Licence',
    'Master',
    'Doctorat',
    'Autres'
  ];
  
  const niveauxCompetence = [
    'Débutant',
    'Intermédiaire',
    'Avancé',
    'Expert'
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 2 Mo');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    // Clear error for this field if exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleArrayChange = (section, index, field, value) => {
    const newArray = [...formData[section]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData(prev => ({ ...prev, [section]: newArray }));
  };

  const addItem = (section, template) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], template]
    }));
  };

  const removeItem = (section, index) => {
    const newArray = formData[section].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [section]: newArray }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate title - IMPORTANT: L'API requiert ce champ
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Le titre du CV est requis';
    }
    
    // Validate personal info
    if (!formData.personal_info.first_name) {
      newErrors.first_name = 'Le prénom est requis';
    }
    if (!formData.personal_info.last_name) {
      newErrors.last_name = 'Le nom est requis';
    }
    if (!formData.personal_info.email) {
      newErrors.email = 'L\'email est requis';
    }
    
    setErrors(newErrors);
    
    // If there are errors, scroll to top and show them
    if (Object.keys(newErrors).length > 0) {
      // Switch to profile step if not already there
      if (step !== 1) {
        setStep(1);
      }
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Prepare data for API submission
    const submitData = {
      title: formData.title,
      personal_info: {
        civilite: formData.personal_info.civilite,
        first_name: formData.personal_info.first_name,
        last_name: formData.personal_info.last_name,
        phone: formData.personal_info.phone,
        birth_date: formData.personal_info.birth_date,
        email: formData.personal_info.email,
        domaine_etude: formData.personal_info.domaine_etude,
        niveau_etude: formData.personal_info.niveau_etude,
        apropos: formData.personal_info.apropos,
        address: formData.personal_info.address,
        driving_license: formData.personal_info.driving_license,
      },
      experience: formData.experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.en_cours ? null : exp.end_date,
        en_cours: exp.en_cours,
        description: exp.description
      })),
      education: formData.education.map(edu => ({
        degree: edu.degree,
        school: edu.school,
        location: edu.location,
        year: edu.en_cours ? null : edu.year,
        start_year: edu.en_cours ? edu.start_year : null,
        en_cours: edu.en_cours,
        description: edu.description
      })),
      languages: formData.languages.map(lang => ({
        name: lang.name,
        level: lang.level
      })),
      skills: formData.skills.map(skill => ({
        name: skill.name,
        level: skill.level
      })),
      photo: photoFile,
      show_photo: showImageOnSite
    };
    
    onSave(submitData);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Titre du CV - Champ obligatoire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du CV <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Développeur Full Stack Senior"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Upload Photo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <HiUser className="h-16 w-16 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <HiUpload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={showImageOnSite}
                  onChange={(e) => setShowImageOnSite(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Afficher ma photo sur le site</span>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Civilité
                </label>
                <select
                  value={formData.personal_info.civilite}
                  onChange={(e) => handleChange('personal_info', 'civilite', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez</option>
                  {civilites.map(civ => (
                    <option key={civ} value={civ}>{civ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personal_info.first_name}
                  onChange={(e) => handleChange('personal_info', 'first_name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personal_info.last_name}
                  onChange={(e) => handleChange('personal_info', 'last_name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.personal_info.phone}
                  onChange={(e) => handleChange('personal_info', 'phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.personal_info.birth_date}
                  onChange={(e) => handleChange('personal_info', 'birth_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.personal_info.email}
                  onChange={(e) => handleChange('personal_info', 'email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domaine d'étude
                </label>
                <input
                  type="text"
                  value={formData.personal_info.domaine_etude}
                  onChange={(e) => handleChange('personal_info', 'domaine_etude', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Informatique, Marketing, Finance..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'étude
                </label>
                <select
                  value={formData.personal_info.niveau_etude}
                  onChange={(e) => handleChange('personal_info', 'niveau_etude', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez</option>
                  {niveauxEtude.map(niveau => (
                    <option key={niveau} value={niveau}>{niveau}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  À propos de moi
                </label>
                <textarea
                  value={formData.personal_info.apropos}
                  onChange={(e) => handleChange('personal_info', 'apropos', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Parlez-nous de vous, vos objectifs, votre personnalité..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.personal_info.driving_license}
                    onChange={(e) => handleChange('personal_info', 'driving_license', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Permis de conduire</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {formData.experience.map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 relative bg-gray-50">
                <button
                  onClick={() => removeItem('experience', index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre du poste
                    </label>
                    <input
                      type="text"
                      value={exp.title || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Développeur Full Stack Senior"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Tech Solutions"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lieu
                    </label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Paris, France"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début
                    </label>
                    <input
                      type="month"
                      value={exp.start_date || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={exp.en_cours || false}
                        onChange={(e) => handleArrayChange('experience', index, 'en_cours', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Poste actuel (en cours)</span>
                    </label>
                  </div>
                  
                  {!exp.en_cours && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="month"
                        value={exp.end_date || ''}
                        onChange={(e) => handleArrayChange('experience', index, 'end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description des missions
                    </label>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Décrivez vos principales missions et réalisations..."
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => addItem('experience', {
                title: '',
                company: '',
                location: '',
                start_date: '',
                end_date: '',
                en_cours: false,
                description: ''
              })}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <HiPlus className="h-5 w-5" />
              Ajouter une expérience
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {formData.education.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 relative bg-gray-50">
                <button
                  onClick={() => removeItem('education', index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre de la formation
                    </label>
                    <select
                      value={edu.degree || ''}
                      onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionnez</option>
                      {niveauxEtude.map(niveau => (
                        <option key={niveau} value={niveau}>{niveau}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Établissement
                    </label>
                    <input
                      type="text"
                      value={edu.school || ''}
                      onChange={(e) => handleArrayChange('education', index, 'school', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Université, École..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lieu
                    </label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => handleArrayChange('education', index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Paris, France"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={edu.en_cours || false}
                        onChange={(e) => handleArrayChange('education', index, 'en_cours', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Formation en cours</span>
                    </label>
                  </div>
                  
                  {!edu.en_cours ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année d'obtention
                      </label>
                      <input
                        type="text"
                        value={edu.year || ''}
                        onChange={(e) => handleArrayChange('education', index, 'year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="2023"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année de début
                      </label>
                      <input
                        type="text"
                        value={edu.start_year || ''}
                        onChange={(e) => handleArrayChange('education', index, 'start_year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="2023"
                      />
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={edu.description || ''}
                      onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Principaux cours, spécialisations, mentions..."
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => addItem('education', {
                degree: '',
                school: '',
                location: '',
                year: '',
                start_year: '',
                en_cours: false,
                description: ''
              })}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <HiPlus className="h-5 w-5" />
              Ajouter une formation
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Langue
                  </label>
                  <input
                    type="text"
                    value={lang.name || ''}
                    onChange={(e) => handleArrayChange('languages', index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Anglais, Espagnol, Allemand..."
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau
                  </label>
                  <select
                    value={lang.level || ''}
                    onChange={(e) => handleArrayChange('languages', index, 'level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez un niveau</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Courant">Courant</option>
                    <option value="Natif">Natif</option>
                  </select>
                </div>
                <button
                  onClick={() => removeItem('languages', index)}
                  className="text-red-500 hover:text-red-700 p-2 mt-7"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => addItem('languages', { name: '', level: '' })}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <HiPlus className="h-5 w-5" />
              Ajouter une langue
            </button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compétence
                    </label>
                    <input
                      type="text"
                      value={skill.name || ''}
                      onChange={(e) => handleArrayChange('skills', index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Python, React, Project Management..."
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau
                    </label>
                    <select
                      value={skill.level || ''}
                      onChange={(e) => handleArrayChange('skills', index, 'level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionnez</option>
                      {niveauxCompetence.map(niveau => (
                        <option key={niveau} value={niveau}>{niveau}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => removeItem('skills', index)}
                    className="text-red-500 hover:text-red-700 p-2 mt-7"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addItem('skills', { name: '', level: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <HiPlus className="h-5 w-5" />
                Ajouter une compétence
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {resume ? 'Modifier le CV' : 'Créer un nouveau CV'}
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <HiX className="h-6 w-6" />
            </button>
          </div>
          
          {/* Steps */}
          <div className="flex justify-between mt-6">
            {steps.map((s) => (
              <button
                key={s.number}
                onClick={() => setStep(s.number)}
                className={`flex flex-col items-center group focus:outline-none ${
                  step >= s.number ? 'text-white' : 'text-blue-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step >= s.number 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'bg-blue-500 text-white group-hover:bg-blue-400'
                }`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2 hidden sm:block font-medium">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between bg-gray-50">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
              step === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <HiChevronLeft className="h-4 w-4" />
            Précédent
          </button>
          
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
            >
              Suivant
              <HiChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {resume ? 'Mettre à jour le CV' : 'Créer mon CV'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CVForm;