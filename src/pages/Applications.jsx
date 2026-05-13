import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { applicationService } from '../api/services';
import { toast } from 'react-toastify';
import { 
  HiBriefcase, 
  HiUser, 
  HiCalendar, 
  HiMail, 
  HiPhone, 
  HiLocationMarker,
  HiDocumentText,
  HiEye,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiSearch,
  HiSparkles,
  HiTrendingUp,
  HiUsers,
  HiStar,
  HiRefresh,
  HiChevronLeft,
  HiChevronRight,
  HiDocumentDuplicate,
  HiAcademicCap,
  HiCog,
  HiOfficeBuilding,
  HiX,
  HiDownload
} from 'react-icons/hi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Applications = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [applications, setApplications] = useState([]);
  const [companyStats, setCompanyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchApplications();
  }, []);

// Ajoutez cette fonction après les autres fonctions
const exportToPDF = async (application, type = 'resume') => {
  try {
    toast.info(t('applications.generating_pdf'));
    
    if (type === 'attached_cv' && getCVUrl(application)) {
      // Pour les CV attachés, on télécharge directement le fichier
      const cvUrl = getCVUrl(application);
      const link = document.createElement('a');
      link.href = cvUrl;
      link.target = '_blank';
      link.download = `CV_${getCandidateName(application).replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('applications.cv_downloaded'));
    } else if (type === 'resume_details' && getResumeDetails(application)) {
      // Pour les résumés détaillés, on génère un PDF à partir du contenu HTML
      const resume = getResumeDetails(application);
      const candidateName = getCandidateName(application);
      
      // Créer un élément temporaire pour le contenu du PDF
      const pdfContent = document.createElement('div');
      pdfContent.style.width = '800px';
      pdfContent.style.padding = '40px';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.color = '#333';
      
      // Générer le HTML du CV
      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">${candidateName}</h1>
          <h2 style="color: #4b5563; font-size: 18px;">${resume.title || 'Curriculum Vitae'}</h2>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        </div>
        
        ${resume.personal_info ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px;">Informations Personnelles</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${resume.personal_info.first_name && resume.personal_info.last_name ? `<p><strong>Nom complet:</strong> ${resume.personal_info.first_name} ${resume.personal_info.last_name}</p>` : ''}
              ${resume.personal_info.email ? `<p><strong>Email:</strong> ${resume.personal_info.email}</p>` : ''}
              ${resume.personal_info.phone ? `<p><strong>Téléphone:</strong> ${resume.personal_info.phone}</p>` : ''}
              ${resume.personal_info.address ? `<p><strong>Adresse:</strong> ${resume.personal_info.address}</p>` : ''}
              ${resume.personal_info.birth_date ? `<p><strong>Date de naissance:</strong> ${resume.personal_info.birth_date}</p>` : ''}
              ${resume.personal_info.niveau_etude ? `<p><strong>Niveau d'étude:</strong> ${resume.personal_info.niveau_etude}</p>` : ''}
            </div>
            ${resume.personal_info.apropos ? `<p style="margin-top: 10px;"><strong>À propos:</strong><br>${resume.personal_info.apropos}</p>` : ''}
          </div>
        ` : ''}
        
        ${resume.experience && resume.experience.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px;">Expériences Professionnelles</h3>
            ${resume.experience.map(exp => `
              <div style="margin-bottom: 15px;">
                <p style="font-weight: bold; margin-bottom: 5px;">${exp.title}</p>
                <p style="color: #4b5563; margin-bottom: 5px;">${exp.company} - ${exp.location}</p>
                <p style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">${exp.start_date} - ${exp.end_date || 'Présent'}</p>
                ${exp.description ? `<p style="font-size: 12px; line-height: 1.5;">${exp.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resume.education && resume.education.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px;">Formations</h3>
            ${resume.education.map(edu => `
              <div style="margin-bottom: 15px;">
                <p style="font-weight: bold; margin-bottom: 5px;">${edu.degree}</p>
                <p style="color: #4b5563; margin-bottom: 5px;">${edu.school} - ${edu.location}</p>
                <p style="color: #6b7280; font-size: 12px;">${edu.year}</p>
                ${edu.description ? `<p style="font-size: 12px; margin-top: 5px;">${edu.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resume.skills && resume.skills.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px;">Compétences</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${resume.skills.map(skill => `
                <span style="background-color: #dbeafe; color: #1e40af; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
                  ${typeof skill === 'string' ? skill : skill.name} ${skill.level ? `(${skill.level})` : ''}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${resume.languages && resume.languages.length > 0 ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px;">Langues</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${resume.languages.map(lang => `
                <span style="background-color: #f3e8ff; color: #6b21a5; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
                  ${typeof lang === 'string' ? lang : lang.name} ${lang.level ? `(${lang.level})` : ''}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 40px; font-size: 10px; color: #9ca3af;">
          Généré le ${new Date().toLocaleDateString()}
        </div>
      `;
      
      document.body.appendChild(pdfContent);
      
      // Utiliser html2canvas pour convertir le HTML en image
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      document.body.removeChild(pdfContent);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
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
      
      pdf.save(`CV_${candidateName.replace(/\s/g, '_')}.pdf`);
      toast.success(t('applications.pdf_generated'));
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.error(t('applications.pdf_error'));
  }
};

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getCompanyApplications();
      
      const data = response.data;
      
      console.log('API Response:', data); // Pour debug
      
      // Vérifier la structure de la réponse
      if (data && data.offers && Array.isArray(data.offers)) {
        setCompanyStats({
          companyName: data.company_name || 'Entreprise',
          totalOffers: data.total_offers || 0,
          totalApplications: data.total_applications || 0
        });
        
        const allApplications = [];
        data.offers.forEach(offer => {
          if (offer.applications && Array.isArray(offer.applications)) {
            offer.applications.forEach(app => {
              allApplications.push({
                ...app,
                offer_details: offer.offer_details,
                applications_stats: offer.applications_stats
              });
            });
          }
        });
        setApplications(allApplications);
      } else if (Array.isArray(data)) {
        setApplications(data);
        setCompanyStats({
          companyName: 'Mes candidatures',
          totalOffers: data.length,
          totalApplications: data.length
        });
      } else if (data && data.results && Array.isArray(data.results)) {
        setApplications(data.results);
        setCompanyStats({
          companyName: 'Mes candidatures',
          totalOffers: data.count || data.results.length,
          totalApplications: data.count || data.results.length
        });
      } else {
        setApplications([]);
        setCompanyStats({
          companyName: 'Entreprise',
          totalOffers: 0,
          totalApplications: 0
        });
      }
      
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(t('applications.errors.load_error'));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      
      const application = applications.find(app => app.id === applicationId);
      
      if (!application) {
        toast.error(t('applications.errors.not_found'));
        return;
      }

      const body = {
        status: newStatus,
        job_offer: application.job_offer,
        resume: application.resume
      };

      await applicationService.updateStatus(applicationId, body);
      
      toast.success(newStatus === 'accepted' 
        ? t('applications.messages.accepted') 
        : t('applications.messages.rejected'));
      
      await fetchApplications();
      
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.status?.[0] || 
                          t('applications.errors.update_error');
      toast.error(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('applications.unknown_date');
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: t('applications.status.pending'),
        icon: HiClock,
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      accepted: {
        label: t('applications.status.accepted'),
        icon: HiCheckCircle,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      },
      rejected: {
        label: t('applications.status.rejected'),
        icon: HiXCircle,
        color: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getCandidateName = (application) => {
    if (application.candidate_details) {
      return `${application.candidate_details.first_name || ''} ${application.candidate_details.last_name || ''}`.trim() || application.candidate_details.username;
    }
    if (application.candidate_name) {
      return application.candidate_name;
    }
    return t('applications.anonymous_candidate');
  };

  const getCandidateEmail = (application) => {
    if (application.candidate_details?.email) {
      return application.candidate_details.email;
    }
    if (application.candidate_email) {
      return application.candidate_email;
    }
    return t('applications.not_provided');
  };

  const getCandidatePhone = (application) => {
    if (application.candidate_details?.phone) {
      return application.candidate_details.phone;
    }
    if (application.candidate_phone) {
      return application.candidate_phone;
    }
    return null;
  };

  const getCoverLetter = (application) => {
    return application.cover_letter || null;
  };

  const getCVUrl = (application) => {
    return application.attached_cv_url || application.attached_cv || null;
  };

  const getResumeDetails = (application) => {
    return application.resume_details || null;
  };

  const hasResumeDetails = (application) => {
    return application.resume_details !== null && application.resume_details !== undefined;
  };

  const hasAttachedCV = (application) => {
    return (application.attached_cv_url || application.attached_cv) !== null;
  };

  const getFilteredApplications = () => {
    let filtered = applications;
    if (filter !== 'all') filtered = filtered.filter(app => app.status === filter);
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const candidateName = getCandidateName(app).toLowerCase();
        const candidateEmail = getCandidateEmail(app).toLowerCase();
        const jobTitle = app.offer_details?.title?.toLowerCase() || app.job_details?.title?.toLowerCase() || '';
        return candidateName.includes(searchLower) || 
               candidateEmail.includes(searchLower) || 
               jobTitle.includes(searchLower);
      });
    }
    return filtered;
  };

  const getPaginatedApplications = () => {
    const filtered = getFilteredApplications();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      items: filtered.slice(startIndex, startIndex + itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      <div className="relative">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );

  const ApplicationCard = ({ application, index }) => {
    const job = application.offer_details || application.job_details;
    const isUpdating = updatingId === application.id;
    const candidateName = getCandidateName(application);
    const candidateEmail = getCandidateEmail(application);
    const candidatePhone = getCandidatePhone(application);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-bl-full" />
        
        <div className="p-6">
          <div className={`flex justify-between items-start mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <div className={`flex items-center gap-3 mb-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {candidateName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {candidateName}
                  </h3>
                  <p className="text-blue-600 text-sm font-medium">{job?.title}</p>
                </div>
              </div>
            </div>
            {getStatusBadge(application.status)}
          </div>

          <div className={`grid grid-cols-2 gap-3 mb-4 ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <HiMail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{candidateEmail}</span>
            </div>
            {candidatePhone && (
              <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <HiPhone className="w-4 h-4 flex-shrink-0" />
                <span>{candidatePhone}</span>
              </div>
            )}
            <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <HiCalendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(application.applied_date)}</span>
            </div>
            {job?.location && (
              <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <HiLocationMarker className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
            )}
          </div>

          {getCoverLetter(application) && (
            <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl">
              <p className="text-sm text-gray-600 line-clamp-2">
                <span className="font-semibold text-gray-700">💬 {t('applications.cover_letter')} :</span> {getCoverLetter(application)}
              </p>
            </div>
          )}

          <div className={`flex gap-2 pt-3 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => setSelectedApplication(application)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
              disabled={isUpdating}
            >
              <HiEye className="w-4 h-4" />
              {t('applications.details')}
            </button>
            {application.status === 'pending' && (
              <>
                <button
                  onClick={() => updateStatus(application.id, 'accepted')}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-4 h-4" />
                      {t('applications.accept')}
                    </>
                  )}
                </button>
                <button
                  onClick={() => updateStatus(application.id, 'rejected')}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <HiXCircle className="w-4 h-4" />
                      {t('applications.reject')}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

const ApplicationDetailModal = ({ application, onClose }) => {
  const job = application.offer_details || application.job_details;
  const resume = getResumeDetails(application);
  const cvUrl = getCVUrl(application);
  const hasResume = hasResumeDetails(application);
  const hasCV = hasAttachedCV(application);
  const isUpdating = updatingId === application.id;
  const candidateName = getCandidateName(application);
  const candidateEmail = getCandidateEmail(application);
  const candidatePhone = getCandidatePhone(application);
  const coverLetter = getCoverLetter(application);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <h2 className="text-2xl font-bold mb-1">{t('applications.modal.title')}</h2>
              <p className="text-blue-100">{t('applications.modal.subtitle')}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
              <HiX className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* En-tête du candidat */}
          <div className="mb-8 pb-6 border-b">
            <div className={`flex items-start gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {candidateName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900">
                  {candidateName}
                </h3>
                <p className="text-blue-600 font-medium mt-1">{job?.title}</p>
                <div className="mt-2">{getStatusBadge(application.status)}</div>
              </div>
            </div>
            
            {/* Informations de contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                <HiMail className="w-5 h-5 text-gray-400" />
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-gray-500">{t('applications.email')}</p>
                  <p className="text-sm font-medium text-gray-900">{candidateEmail}</p>
                </div>
              </div>
              {candidatePhone && (
                <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <HiPhone className="w-5 h-5 text-gray-400" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-500">{t('applications.phone')}</p>
                    <p className="text-sm font-medium text-gray-900">{candidatePhone}</p>
                  </div>
                </div>
              )}
              <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                <HiCalendar className="w-5 h-5 text-gray-400" />
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-gray-500">{t('applications.application_date')}</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(application.applied_date)}</p>
                </div>
              </div>
              {job?.location && (
                <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <HiLocationMarker className="w-5 h-5 text-gray-400" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-500">{t('applications.location')}</p>
                    <p className="text-sm font-medium text-gray-900">{job.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Détails de l'offre d'emploi */}
          <div className="mb-8">
            <h4 className={`text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <HiBriefcase className="w-4 h-4 text-white" />
              </div>
              {t('applications.job_offer')}
            </h4>
            <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-4">
              <p className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>{job?.title}</p>
              <p className={`text-sm text-gray-600 mb-3 ${isRTL ? 'text-right' : ''}`}>{job?.description}</p>
              <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {job?.location && <span className="text-xs bg-white px-2.5 py-1 rounded-lg shadow-sm">📍 {job.location}</span>}
                {job?.contract_type && <span className="text-xs bg-white px-2.5 py-1 rounded-lg shadow-sm">📄 {job.contract_type}</span>}
                {job?.salary_min && job?.salary_max && (
                  <span className="text-xs bg-white px-2.5 py-1 rounded-lg shadow-sm">💰 {job.salary_min} - {job.salary_max} MRU</span>
                )}
              </div>
            </div>
          </div>

        {/* CV attaché (pour les candidats sans compte) */}
        {hasCV && cvUrl && (
          <div className="mb-8">
            <div className={`flex justify-between items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h4 className={`text-lg font-bold text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <HiDownload className="w-4 h-4 text-white" />
                </div>
                {t('applications.cv_file')}
              </h4>
              <button
                onClick={() => exportToPDF(application, 'attached_cv')}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm"
              >
                <HiDownload className="w-4 h-4" />
                {t('applications.export_cv')}
              </button>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-4">
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <HiDownload className="w-4 h-4" />
                {t('applications.download_cv')}
              </a>
            </div>
          </div>
        )}

        {/* CV du profil (pour les candidats connectés) - Affichage détaillé */}
        {hasResume && resume && (
          <div className="mb-8">
            <div className={`flex justify-between items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h4 className={`text-lg font-bold text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <HiDocumentDuplicate className="w-4 h-4 text-white" />
                </div>
                {t('applications.resume')} : {resume.title}
              </h4>
              <button
                onClick={() => exportToPDF(application, 'resume_details')}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all text-sm"
              >
                <HiDownload className="w-4 h-4" />
                {t('applications.export_resume')}
              </button>
            </div>
            
            {/* Le reste du contenu du CV reste identique */}
            <div className="space-y-4">
              {/* ... tout le contenu existant du CV ... */}
            </div>
          </div>
        )}

          {/* CV du profil (pour les candidats connectés) - Affichage détaillé */}
          {hasResume && resume && (
            <div className="mb-8">
              <h4 className={`text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <HiDocumentDuplicate className="w-4 h-4 text-white" />
                </div>
                {t('applications.resume')} : {resume.title}
              </h4>
              
              <div className="space-y-4">
                {/* Informations personnelles */}
                {resume.personal_info && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-4">
                    <h5 className={`font-semibold text-gray-800 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiUser className="w-4 h-4 text-blue-600" />
                      {t('applications.personal_info')}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {resume.personal_info.first_name && resume.personal_info.last_name && (
                        <p><span className="font-semibold">{t('applications.full_name')} :</span> {resume.personal_info.first_name} {resume.personal_info.last_name}</p>
                      )}
                      {resume.personal_info.email && <p><span className="font-semibold">📧 Email :</span> {resume.personal_info.email}</p>}
                      {resume.personal_info.phone && <p><span className="font-semibold">📞 {t('applications.phone')} :</span> {resume.personal_info.phone}</p>}
                      {resume.personal_info.address && <p><span className="font-semibold">📍 {t('applications.address')} :</span> {resume.personal_info.address}</p>}
                      {resume.personal_info.birth_date && <p><span className="font-semibold">🎂 {t('applications.birth_date')} :</span> {resume.personal_info.birth_date}</p>}
                      {resume.personal_info.niveau_etude && <p><span className="font-semibold">🎓 {t('applications.education_level')} :</span> {resume.personal_info.niveau_etude}</p>}
                      {resume.personal_info.domaine_etude && <p><span className="font-semibold">📚 {t('applications.field_of_study')} :</span> {resume.personal_info.domaine_etude}</p>}
                    </div>
                    {resume.personal_info.apropos && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm"><span className="font-semibold">📝 {t('applications.about')} :</span></p>
                        <p className="text-sm text-gray-600 mt-1">{resume.personal_info.apropos}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Expériences professionnelles */}
                {resume.experience && resume.experience.length > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-4">
                    <h5 className={`font-semibold text-gray-800 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiBriefcase className="w-4 h-4 text-blue-600" />
                      {t('applications.work_experience')}
                    </h5>
                    <div className="space-y-3">
                      {resume.experience.map((exp, idx) => (
                        <div key={idx} className="border-l-2 border-blue-200 pl-3">
                          <p className="font-medium text-gray-800">{exp.title}</p>
                          <p className="text-sm text-gray-600">{exp.company} - {exp.location}</p>
                          <p className="text-xs text-gray-500">
                            {exp.start_date} - {exp.end_date || t('applications.present')}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formations */}
                {resume.education && resume.education.length > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-4">
                    <h5 className={`font-semibold text-gray-800 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiAcademicCap className="w-4 h-4 text-blue-600" />
                      {t('applications.education')}
                    </h5>
                    <div className="space-y-3">
                      {resume.education.map((edu, idx) => (
                        <div key={idx} className="border-l-2 border-green-200 pl-3">
                          <p className="font-medium text-gray-800">{edu.degree}</p>
                          <p className="text-sm text-gray-600">{edu.school} - {edu.location}</p>
                          <p className="text-xs text-gray-500">{edu.year}</p>
                          {edu.description && <p className="text-sm text-gray-600 mt-1">{edu.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compétences */}
                {resume.skills && resume.skills.length > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-4">
                    <h5 className={`font-semibold text-gray-800 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiCog className="w-4 h-4 text-blue-600" />
                      {t('applications.skills')}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : skill.name} {skill.level && `(${skill.level})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Langues */}
                {resume.languages && resume.languages.length > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-4">
                    <h5 className={`font-semibold text-gray-800 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiOfficeBuilding className="w-4 h-4 text-blue-600" />
                      {t('applications.languages')}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {resume.languages.map((lang, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                          {typeof lang === 'string' ? lang : lang.name} {lang.level && `(${lang.level})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lettre de motivation */}
          {coverLetter && (
            <div className="mb-8">
              <h4 className={`text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <HiDocumentText className="w-4 h-4 text-white" />
                </div>
                {t('applications.cover_letter')}
              </h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className={`text-gray-700 whitespace-pre-wrap ${isRTL ? 'text-right' : ''}`}>{coverLetter}</p>
              </div>
            </div>
          )}

          {/* Boutons d'action pour les candidatures en attente */}
          {application.status === 'pending' && (
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => {
                    updateStatus(application.id, 'accepted');
                    onClose();
                  }}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5" />
                      {t('applications.accept_application')}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    updateStatus(application.id, 'rejected');
                    onClose();
                  }}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <HiXCircle className="w-5 h-5" />
                      {t('applications.reject_application')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

  const { items: paginatedApps, totalPages } = getPaginatedApplications();

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 ${isRTL ? 'text-right' : ''}`}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">{t('applications.loading')}</p>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { value: 'all', label: t('applications.filters.all'), color: 'gray' },
    { value: 'pending', label: t('applications.filters.pending'), color: 'amber' },
    { value: 'accepted', label: t('applications.filters.accepted'), color: 'emerald' },
    { value: 'rejected', label: t('applications.filters.rejected'), color: 'rose' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 ${isRTL ? 'text-right' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div>
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <HiUsers className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{t('applications.title')}</h1>
              </div>
              <p className={`text-gray-500 ${isRTL ? 'mr-12' : 'ml-12'}`}>
                {companyStats?.companyName} - {t('applications.subtitle')}
              </p>
            </div>
            <button
              onClick={fetchApplications}
              className={`flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <HiRefresh className="w-4 h-4" />
              {t('applications.refresh')}
            </button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title={t('applications.stats.total')} value={stats.total} icon={HiBriefcase} gradient="from-blue-500 to-indigo-600" />
          <StatCard title={t('applications.stats.pending')} value={stats.pending} icon={HiClock} gradient="from-amber-500 to-orange-600" />
          <StatCard title={t('applications.stats.accepted')} value={stats.accepted} icon={HiCheckCircle} gradient="from-emerald-500 to-teal-600" />
          <StatCard title={t('applications.stats.rejected')} value={stats.rejected} icon={HiXCircle} gradient="from-rose-500 to-red-600" />
        </div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8"
        >
          <div className={`flex flex-col lg:flex-row gap-4 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <div className="relative">
                <HiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <input
                  type="text"
                  placeholder={t('applications.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
              </div>
            </div>
            <div className={`flex gap-2 overflow-x-auto pb-2 lg:pb-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    filter === option.value
                      ? `bg-gradient-to-r from-${option.color}-500 to-${option.color}-600 text-white shadow-md`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Liste des candidatures */}
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-sm"
          >
            <div className="text-7xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('applications.no_applications.title')}</h3>
            <p className="text-gray-500">{t('applications.no_applications.subtitle')}</p>
          </motion.div>
        ) : paginatedApps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-sm"
          >
            <div className="text-7xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('applications.no_results.title')}</h3>
            <p className="text-gray-500">{t('applications.no_results.subtitle')}</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedApps.map((application, index) => (
                <ApplicationCard key={application.id} application={application} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex justify-center gap-2 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  {isRTL ? <HiChevronRight className="w-5 h-5" /> : <HiChevronLeft className="w-5 h-5" />}
                </button>
                <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  {isRTL ? <HiChevronLeft className="w-5 h-5" /> : <HiChevronRight className="w-5 h-5" />}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de détail */}
      <AnimatePresence>
        {selectedApplication && (
          <ApplicationDetailModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Applications;