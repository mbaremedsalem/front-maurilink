import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeService } from '../api/services';
import { toast } from 'react-toastify';
import CVForm from '../components/CVForm';
import { HiPlus, HiDocumentText, HiDownload, HiPencil, HiTrash, HiEye, HiStar, HiX } from 'react-icons/hi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await resumeService.getAll();
      const resumesData = response.data.results || response.data;
      setResumes(resumesData);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Erreur lors du chargement des CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (resumeData) => {
    try {
      if (editingResume) {
        const response = await resumeService.update(editingResume.id, resumeData);
        toast.success('CV mis à jour avec succès');
        setResumes(resumes.map(r => r.id === editingResume.id ? response.data : r));
      } else {
        const response = await resumeService.create(resumeData);
        toast.success('CV créé avec succès');
        setResumes([...resumes, response.data]);
      }
      setShowForm(false);
      setEditingResume(null);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error(error.response?.data?.title?.[0] || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce CV ?')) {
      try {
        await resumeService.delete(id);
        toast.success('CV supprimé avec succès');
        setResumes(resumes.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting resume:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await resumeService.setDefault(id);
      toast.success('CV par défaut mis à jour');
      fetchResumes();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Fonction pour extraire les noms des compétences (que ce soit string ou objet)
  const getSkillNames = (skills) => {
    if (!skills || !Array.isArray(skills)) return [];
    return skills.map(skill => {
      if (typeof skill === 'string') return skill;
      if (typeof skill === 'object' && skill.name) return skill.name;
      return '';
    }).filter(s => s);
  };

  // Fonction pour extraire les noms des langues
  const getLanguageNames = (languages) => {
    if (!languages || !Array.isArray(languages)) return [];
    return languages.map(lang => {
      if (typeof lang === 'string') return lang;
      if (typeof lang === 'object' && lang.name) return `${lang.name} (${lang.level})`;
      return '';
    }).filter(l => l);
  };

  const generatePDF = async (resume) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
          <h1 style="font-size: 28px; margin-bottom: 10px;">${resume.personal_info?.first_name || ''} ${resume.personal_info?.last_name || ''}</h1>
          <h2 style="font-size: 18px; color: #666;">${resume.title || 'CV Professionnel'}</h2>
          <div style="margin-top: 10px; font-size: 14px; color: #666;">
            ${resume.personal_info?.email || ''} | ${resume.personal_info?.phone || ''} | ${resume.personal_info?.address || ''}
          </div>
        </div>
        
        ${resume.experience?.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 20px; color: #3b82f6; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Expériences Professionnelles</h2>
            ${resume.experience.map(exp => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-weight: bold; font-size: 16px;">${exp.title || exp.position || ''}</h3>
                <div style="color: #666; font-size: 14px; margin-bottom: 5px;">${exp.company || ''} | ${exp.start_date || ''} ${exp.en_cours ? '- Présent' : exp.end_date ? '- ' + exp.end_date : ''}</div>
                <div style="margin-top: 5px;">${exp.description || ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resume.education?.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 20px; color: #3b82f6; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Formation</h2>
            ${resume.education.map(edu => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-weight: bold; font-size: 16px;">${edu.degree || ''}</h3>
                <div style="color: #666; font-size: 14px;">${edu.school || ''} | ${edu.en_cours ? 'En cours (début: ' + (edu.start_year || '') + ')' : edu.year || ''}</div>
                <div>${edu.description || ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resume.skills?.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 20px; color: #3b82f6; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Compétences</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${getSkillNames(resume.skills).map(skill => `<span style="background: #e5e7eb; padding: 5px 12px; border-radius: 15px; font-size: 14px;">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${resume.languages?.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 20px; color: #3b82f6; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Langues</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 15px;">
              ${getLanguageNames(resume.languages).map(lang => `
                <div style="background: #f3f4f6; padding: 5px 15px; border-radius: 5px;">
                  ${lang}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(element);
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${resume.title || 'CV'}_${resume.personal_info?.first_name || ''}_${resume.personal_info?.last_name || ''}.pdf`);
      toast.success('PDF généré avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      document.body.removeChild(element);
    }
  };

  const CVCard = ({ resume }) => {
    const skillNames = getSkillNames(resume.skills);
    const languageNames = getLanguageNames(resume.languages);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-white">
              <HiDocumentText className="h-6 w-6" />
              <h3 className="font-semibold text-lg truncate">{resume.title || 'Sans titre'}</h3>
            </div>
            {resume.is_default && (
              <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <HiStar className="h-3 w-3" />
                Par défaut
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{resume.personal_info?.first_name || ''} {resume.personal_info?.last_name || ''}</span>
            </p>
            <p className="text-xs text-gray-500">
              📅 {resume.updated_at ? `Mis à jour le ${new Date(resume.updated_at).toLocaleDateString('fr-FR')}` : `Créé le ${new Date(resume.created_at).toLocaleDateString('fr-FR')}`}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {skillNames.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
              {skillNames.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{skillNames.length - 3}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 pt-3 border-t">
            <button
              onClick={() => setPreviewResume(resume)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <HiEye className="h-4 w-4" />
              Voir
            </button>
            <button
              onClick={() => generatePDF(resume)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <HiDownload className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={() => {
                setEditingResume(resume);
                setShowForm(true);
              }}
              className="flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <HiPencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(resume.id)}
              className="flex items-center justify-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <HiTrash className="h-4 w-4" />
            </button>
          </div>
          
          {!resume.is_default && (
            <button
              onClick={() => handleSetDefault(resume.id)}
              className="w-full mt-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              Définir comme CV par défaut
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const PreviewModal = ({ resume, onClose }) => {
    const skillNames = getSkillNames(resume.skills);
    const languageNames = getLanguageNames(resume.languages);
    
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
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Aperçu du CV</h2>
            <div className="flex gap-2">
              <button
                onClick={() => generatePDF(resume)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <HiDownload className="h-4 w-4" />
                Télécharger PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8 pb-8 border-b">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {resume.personal_info?.first_name || ''} {resume.personal_info?.last_name || ''}
              </h1>
              <p className="text-lg text-gray-600">{resume.title || ''}</p>
              <div className="flex justify-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
                {resume.personal_info?.email && <span>📧 {resume.personal_info.email}</span>}
                {resume.personal_info?.phone && <span>📞 {resume.personal_info.phone}</span>}
                {resume.personal_info?.address && <span>📍 {resume.personal_info.address}</span>}
              </div>
            </div>

            {/* À propos */}
            {resume.personal_info?.apropos && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                  À propos de moi
                </h2>
                <p className="text-gray-700">{resume.personal_info.apropos}</p>
              </div>
            )}

            {/* Expériences */}
            {resume.experience?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                  Expériences Professionnelles
                </h2>
                {resume.experience.map((exp, index) => (
                  <div key={index} className="mb-4">
                    <h3 className="font-semibold text-gray-900">{exp.title || exp.position || ''}</h3>
                    <p className="text-gray-600 text-sm">
                      {exp.company || ''} | {exp.location || ''} | {exp.start_date || ''} {exp.en_cours ? '- Présent' : exp.end_date ? '- ' + exp.end_date : ''}
                    </p>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{exp.description || ''}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Formations */}
            {resume.education?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                  Formation
                </h2>
                {resume.education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <h3 className="font-semibold text-gray-900">{edu.degree || ''}</h3>
                    <p className="text-gray-600 text-sm">
                      {edu.school || ''} | {edu.location || ''} | {edu.en_cours ? `En cours (début: ${edu.start_year || ''})` : edu.year || ''}
                    </p>
                    <p className="text-gray-700 mt-1">{edu.description || ''}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Compétences */}
            {skillNames.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                  Compétences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillNames.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Langues */}
            {languageNames.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                  Langues
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {resume.languages?.map((lang, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-medium">{lang.name || ''}</span>
                      <span className="text-gray-600">{lang.level || ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes CVs</h1>
            <p className="text-gray-600 mt-1">Gérez vos CVs et créez-en de nouveaux</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingResume(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <HiPlus className="h-5 w-5" />
            Créer un CV
          </motion.button>
        </div>

        {/* CV Grid */}
        {resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm"
          >
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun CV</h3>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore créé de CV</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer mon premier CV
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <CVCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </div>

      {/* CV Form Modal */}
      <AnimatePresence>
        {showForm && (
          <CVForm
            resume={editingResume}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditingResume(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewResume && (
          <PreviewModal
            resume={previewResume}
            onClose={() => setPreviewResume(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resumes;