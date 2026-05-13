import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { jobService, applicationService, resumeService } from '../api/services';
import { 
  HiLocationMarker, 
  HiCurrencyEuro, 
  HiCalendar, 
  HiBriefcase,
  HiOfficeBuilding,
  HiUserGroup,
  HiCheckCircle,
  HiShare,
  HiBookmark,
  HiArrowLeft,
  HiDocumentText,
  HiCheck,
  HiX,
  HiInformationCircle,
  HiClock,
  HiExternalLink,
  HiMail,
  HiPhone,
  HiGlobeAlt,
  HiStar,
  HiTrendingUp,
  HiBadgeCheck,
  HiHeart,
  HiUsers,
  HiCog,
  HiAcademicCap,
  HiLightBulb,
  HiArrowRight,
  HiDocumentDownload,
  HiEye
} from 'react-icons/hi';
import { HiBuildingOffice2 } from 'react-icons/hi2';
import { toast } from 'react-toastify';

const JobDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [similarJobs, setSimilarJobs] = useState([]);
  
  // États pour la candidature sans connexion
  const [showGuestApplyModal, setShowGuestApplyModal] = useState(false);
  const [guestFormData, setGuestFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    cover_letter: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const isAuthenticated = !!localStorage.getItem('access_token');

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'https://back.maurilink.site';
    return `${baseUrl}${logoPath}`;
  };

  const getArrowIcon = () => {
    if (isRTL) {
      return <span className="transform group-hover:-translate-x-1 transition-transform">←</span>;
    }
    return <span className="transform group-hover:translate-x-1 transition-transform">→</span>;
  };

  // 👇 AJOUTE CETTE FONCTION ICI
const getPdfViewerUrl = () => {
  if (!job?.job_description_file) return null;
  return `https://back.maurilink.site/api/jobs/offers/${job.id}/pdf/`;
};

  useEffect(() => {
    fetchJob();
    if (isAuthenticated) {
      fetchUserResumes();
      checkIfAlreadyApplied();
    }
    fetchSimilarJobs();
    window.scrollTo(0, 0);
  }, [id, isAuthenticated]);

  const fetchJob = async () => {
    try {
      const response = await jobService.getById(id);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error(t('jobDetail.errors.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarJobs = async () => {
    try {
      const response = await jobService.getAll();
      const jobs = response.data.results || response.data;
      const similar = jobs.filter(j => j.id !== parseInt(id)).slice(0, 3);
      setSimilarJobs(similar);
    } catch (error) {
      console.error('Error fetching similar jobs:', error);
    }
  };

  const fetchUserResumes = async () => {
    try {
      const response = await resumeService.getAll();
      const resumesData = response.data.results || response.data;
      setResumes(resumesData);
      const defaultResume = resumesData.find(r => r.is_default);
      if (defaultResume) {
        setSelectedResume(defaultResume.id);
      } else if (resumesData.length > 0) {
        setSelectedResume(resumesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const checkIfAlreadyApplied = async () => {
    try {
      const response = await applicationService.getMyApplications();
      const applications = response.data.results || response.data;
      const alreadyApplied = applications.some(app => app.job_offer === parseInt(id));
      setHasApplied(alreadyApplied);
    } catch (error) {
      console.error('Error checking applications:', error);
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.warning(t('jobDetail.messages.login_to_save'));
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }
    setSaved(!saved);
    toast.success(saved ? t('jobDetail.messages.removed_favorites') : t('jobDetail.messages.added_favorites'));
  };

  const handleShare = async () => {
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Clipboard API failed:', err);
        return false;
      }
    };

    const fallbackCopyToClipboard = (text) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch (err) {
        console.error('Fallback copy failed:', err);
        document.body.removeChild(textarea);
        return false;
      }
    };

    const url = window.location.href;
    let success = await copyToClipboard(url);
    
    if (!success) {
      success = fallbackCopyToClipboard(url);
    }

    if (success) {
      toast.success(t('jobDetail.messages.link_copied'));
    } else {
      toast.error(t('jobDetail.messages.copy_error') + url, {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleOpenApplyModal = () => {
    if (isAuthenticated) {
      setShowApplyModal(true);
    } else {
      setShowGuestApplyModal(true);
    }
  };

  const handleApply = async () => {
    if (!selectedResume) {
      toast.warning(t('jobDetail.messages.select_resume'));
      return;
    }

    if (!coverLetter.trim()) {
      toast.warning(t('jobDetail.messages.add_cover_letter'));
      return;
    }

    setSubmitting(true);

    try {
      const applicationData = {
        job_offer: parseInt(id),
        resume: selectedResume,
        cover_letter: coverLetter
      };

      const response = await applicationService.apply(applicationData);
      setApplicationResult(response.data);
      
      toast.success(t('jobDetail.messages.application_sent'));
      
      setTimeout(() => {
        setShowApplyModal(false);
        setApplicationResult(null);
        setCoverLetter('');
        setHasApplied(true);
      }, 2500);
    } catch (error) {
      console.error('Error applying:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          t('jobDetail.errors.application_error');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestApply = async () => {
    if (!guestFormData.candidate_name.trim()) {
      toast.warning(t('jobDetail.messages.enter_name'));
      return;
    }
    
    if (!guestFormData.candidate_email.trim()) {
      toast.warning(t('jobDetail.messages.enter_email'));
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestFormData.candidate_email)) {
      toast.warning(t('jobDetail.messages.invalid_email'));
      return;
    }
    
    if (!selectedFile) {
      toast.warning(t('jobDetail.messages.select_cv_file'));
      return;
    }
    
    if (!guestFormData.cover_letter.trim()) {
      toast.warning(t('jobDetail.messages.add_cover_letter'));
      return;
    }

    setGuestSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('job_offer', id);
      formData.append('candidate_name', guestFormData.candidate_name);
      formData.append('candidate_email', guestFormData.candidate_email);
      formData.append('candidate_phone', guestFormData.candidate_phone);
      formData.append('cover_letter', guestFormData.cover_letter);
      formData.append('attached_cv', selectedFile);

      const response = await applicationService.applyAsGuest(formData);
      
      setApplicationResult(response.data);
      toast.success(t('jobDetail.messages.application_sent'));
      
      setTimeout(() => {
        setShowGuestApplyModal(false);
        setApplicationResult(null);
        setGuestFormData({
          candidate_name: '',
          candidate_email: '',
          candidate_phone: '',
          cover_letter: ''
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error applying as guest:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          t('jobDetail.errors.application_error');
      toast.error(errorMessage);
    } finally {
      setGuestSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.warning(t('jobDetail.messages.invalid_file_type'));
        e.target.value = '';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.warning(t('jobDetail.messages.file_too_large'));
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return t('jobDetail.not_specified');
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR').format(salary) + ' MRU';
  };

  const formatDate = (dateString, format = 'short') => {
    if (!dateString) return t('jobDetail.not_specified');
    const date = new Date(dateString);
    const options = format === 'short' 
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', options);
  };

  const getContractTypeColor = (type) => {
    const colors = {
      'CDI': 'bg-green-100 text-green-800',
      'CDD': 'bg-blue-100 text-blue-800',
      'Stage': 'bg-purple-100 text-purple-800',
      'Alternance': 'bg-orange-100 text-orange-800',
      'Freelance': 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getContractTypeIcon = (type) => {
    const icons = {
      'CDI': <HiBriefcase className="h-3 w-3" />,
      'CDD': <HiClock className="h-3 w-3" />,
      'Stage': <HiAcademicCap className="h-3 w-3" />,
      'Alternance': <HiTrendingUp className="h-3 w-3" />,
      'Freelance': <HiCog className="h-3 w-3" />
    };
    return icons[type] || <HiBriefcase className="h-3 w-3" />;
  };

  const getContractTypeLabel = (type) => {
    const labels = {
      'CDI': t('jobDetail.contract_types.cdi'),
      'CDD': t('jobDetail.contract_types.cdd'),
      'Stage': t('jobDetail.contract_types.stage'),
      'Alternance': t('jobDetail.contract_types.alternance'),
      'Freelance': t('jobDetail.contract_types.freelance')
    };
    return labels[type] || type || t('jobDetail.not_specified');
  };

  // Définition des tabs avec gestion du PDF
  const getTabs = () => {
    const tabs = [
      { id: 'description', label: t('jobDetail.tabs.description'), icon: HiInformationCircle },
      { id: 'requirements', label: t('jobDetail.tabs.requirements'), icon: HiBadgeCheck },
      { id: 'benefits', label: t('jobDetail.tabs.benefits'), icon: HiStar }
    ];
    
    // Ajouter l'onglet PDF si un fichier existe
    if (job?.job_description_file) {
      tabs.push({ id: 'pdf', label: t('jobDetail.tabs.pdf'), icon: HiDocumentText });
    }
    
    return tabs;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="rounded-full h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 border-4 border-blue-200"></div>
          <div className="rounded-full h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </motion.div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3 sm:mb-4 md:mb-5 lg:mb-6">🔍</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{t('jobDetail.not_found.title')}</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 md:mb-7 lg:mb-8">{t('jobDetail.not_found.subtitle')}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
          >
            <HiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('jobDetail.back_to_jobs')}
          </Link>
        </motion.div>
      </div>
    );
  }

  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4">
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-blue-600 transition-colors group text-sm sm:text-base"
            >
              <HiArrowLeft className={`group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5`} />
              <span className="hidden xs:inline">{t('jobDetail.back_to_jobs')}</span>
            </Link>
            <div className={`flex gap-1.5 sm:gap-2 md:gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="bg-gray-100 p-1.5 sm:p-2 md:p-2.5 rounded-full hover:bg-gray-200 transition-all"
              >
                <HiBookmark className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 ${saved ? 'text-blue-600 fill-current' : 'text-gray-600'}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="bg-gray-100 p-1.5 sm:p-2 md:p-2.5 rounded-full hover:bg-gray-200 transition-all"
              >
                <HiShare className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-7 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Job Header Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-4 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 md:py-7 lg:py-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className={`flex flex-col xs:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 items-start xs:items-center ${isRTL ? 'xs:flex-row-reverse' : ''}`}>
                        <div className="flex-shrink-0 self-center xs:self-auto">
                          {getLogoUrl(job.company_details?.logo) ? (
                            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-24 lg:h-24 bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex items-center justify-center p-1 xs:p-1.5 sm:p-2">
                              <img
                                src={getLogoUrl(job.company_details?.logo)}
                                alt={job.company_details?.company_name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_details?.company_name || 'Company')}&background=ffffff&color=3b82f6&size=96&rounded=true&bold=true`;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-24 lg:h-24 bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center">
                              <HiOfficeBuilding className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-12 lg:w-12 text-blue-600" />
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex-1 text-center xs:text-left w-full ${isRTL ? 'xs:text-right' : ''}`}>
                          <div className={`flex flex-wrap items-center justify-center xs:justify-start gap-1 sm:gap-1.5 md:gap-2 mb-1.5 sm:mb-2 md:mb-2.5 ${isRTL ? 'xs:justify-end' : ''}`}>
                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-xs font-semibold ${getContractTypeColor(job.contract_type)}`}>
                              {getContractTypeIcon(job.contract_type)}
                              <span className="hidden xs:inline">{getContractTypeLabel(job.contract_type)}</span>
                            </span>
                            {job.is_urgent && (
                              <span className="bg-red-500 text-white px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1">
                                <HiClock className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                <span className="hidden xs:inline">{t('jobDetail.urgent')}</span>
                              </span>
                            )}
                            {job.featured && (
                              <span className="bg-yellow-400 text-gray-900 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1">
                                <HiStar className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                <span className="hidden xs:inline">{t('jobDetail.featured')}</span>
                              </span>
                            )}
                            {/* Badge PDF */}
                            {job.job_description_file && (
                              <a
                                href={job.job_description_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 bg-red-100 text-red-700 rounded-full text-[10px] xs:text-xs font-semibold hover:bg-red-200 transition-colors"
                              >
                                <HiDocumentText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="hidden xs:inline">{t('jobDetail.pdf_description')}</span>
                                <HiExternalLink className="h-2 w-2" />
                              </a>
                            )}
                          </div>
                          <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-1.5 md:mb-2 break-words leading-tight">
                            {job.title}
                          </h1>
                          <div className={`flex items-center justify-center xs:justify-start gap-1 sm:gap-1.5 md:gap-2 text-blue-100 text-xs sm:text-sm md:text-base ${isRTL ? 'xs:justify-end' : ''}`}>
                            <HiOfficeBuilding className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                            <p className="truncate">{job.company_details?.company_name || t('jobDetail.company')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 p-3 sm:p-3.5 md:p-4 border-b border-gray-100 bg-gray-50/50">
                  {[
                    { icon: HiLocationMarker, label: t('jobDetail.location'), value: job.location || t('jobDetail.not_specified'), color: 'blue' },
                    { icon: HiCurrencyEuro, label: t('jobDetail.salary'), value: job.salary_min && job.salary_max ? `${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()}` : t('jobDetail.not_specified'), color: 'green' },
                    { icon: HiCalendar, label: t('jobDetail.published_on'), value: formatDate(job.published_date, 'short'), color: 'purple' },
                    { icon: HiUserGroup, label: t('jobDetail.applications'), value: job.applications_count || 0, color: 'orange' }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-1.5 sm:gap-2 md:gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-1 sm:p-1.5 md:p-2 bg-${item.color}-100 rounded-lg flex-shrink-0`}>
                        <item.icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-${item.color}-600`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">{item.label}</p>
                        <p className="font-semibold text-gray-900 text-[9px] xs:text-[10px] sm:text-xs md:text-sm truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-b border-gray-200 px-3 sm:px-4 md:px-6 overflow-x-auto">
                  <div className={`flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-w-max ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2.5 sm:py-3 md:py-3.5 px-0.5 sm:px-1 font-medium text-xs sm:text-sm transition-all relative flex items-center gap-1 sm:gap-1.5 md:gap-2 whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <tab.icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-3 sm:p-4 md:p-5 lg:p-6 ${isRTL ? 'text-right' : ''}`}>
                  {activeTab === 'description' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose max-w-none"
                    >
                      <h3 className={`text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <HiInformationCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                        {t('jobDetail.tabs.description')}
                      </h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base">
                        {job.description}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'requirements' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className={`text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <HiBadgeCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                        {t('jobDetail.tabs.requirements')}
                      </h3>
                      
                      {job.criteria?.skills && job.criteria.skills.length > 0 && (
                        <div className="mb-4 sm:mb-5 md:mb-6">
                          <h4 className={`font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-2.5 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}>{t('jobDetail.technical_skills')}</h4>
                          <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {job.criteria.skills.map((skill, index) => (
                              <motion.span
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-1.5 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-lg text-[10px] xs:text-xs sm:text-sm font-medium border border-blue-100"
                              >
                                {skill}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.criteria && Object.keys(job.criteria).length > 0 && (
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                          {Object.entries(job.criteria).map(([key, value]) => {
                            if (key === 'skills' || Array.isArray(value)) return null;
                            const keyLabel = {
                              experience: t('jobDetail.experience'),
                              education: t('jobDetail.education'),
                              languages: t('jobDetail.languages')
                            }[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                            
                            return (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-start gap-1.5 sm:gap-2 md:gap-2.5 p-2 sm:p-2.5 md:p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
                              >
                                <HiBadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <dt className="text-xs sm:text-sm font-medium text-gray-900">
                                    {keyLabel}
                                  </dt>
                                  <dd className="text-gray-600 text-xs sm:text-sm break-words">{value}</dd>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'benefits' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className={`text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <HiStar className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                        {t('jobDetail.tabs.benefits')}
                      </h3>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2 md:gap-2.5">
                        {[
                          { icon: HiTrendingUp, label: t('jobDetail.benefits.career_growth'), color: 'green' },
                          { icon: HiOfficeBuilding, label: t('jobDetail.benefits.pro_environment'), color: 'blue' },
                          { icon: HiCalendar, label: t('jobDetail.benefits.paid_vacation'), color: 'purple' },
                          { icon: HiCurrencyEuro, label: t('jobDetail.benefits.health_insurance'), color: 'orange' },
                          { icon: HiUsers, label: t('jobDetail.benefits.dynamic_team'), color: 'red' },
                          { icon: HiLightBulb, label: t('jobDetail.benefits.training'), color: 'yellow' }
                        ].map((benefit, idx) => (
                          <div key={idx} className={`flex items-center gap-1.5 sm:gap-2 md:gap-2.5 p-1.5 sm:p-2 md:p-2.5 bg-${benefit.color}-50 rounded-lg hover:shadow-md transition-shadow ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <benefit.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 text-${benefit.color}-600 flex-shrink-0`} />
                            <span className="text-gray-700 text-xs sm:text-sm">{benefit.label}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* NOUVEAU: Onglet PDF */}
                  {activeTab === 'pdf' && job.job_description_file && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className={`text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <HiDocumentText className="h-5 w-5 text-blue-600" />
                          {t('jobDetail.job_description')}
                        </h3>
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <a
                            href={job.job_description_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                          >
                            <HiEye className="h-3.5 w-3.5" />
                            {t('jobDetail.view_pdf')}
                            <HiExternalLink className="h-3 w-3" />
                          </a>
                          <a
                            href={job.job_description_file}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                          >
                            <HiDocumentDownload className="h-3.5 w-3.5" />
                            {t('jobDetail.download_pdf')}
                          </a>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-2 sm:p-4">
                        <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white" style={{ height: '70vh', minHeight: '500px' }}>
                          <iframe
                            src={`${job.job_description_file}#toolbar=0&navpanes=0&scrollbar=0`}
                            title={job.title}
                            className="w-full h-full"
                            frameBorder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
                        <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <HiInformationCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm text-blue-800 font-medium mb-0.5">
                              {t('jobDetail.pdf_info_title')}
                            </p>
                            <p className="text-xs text-blue-700">
                              {t('jobDetail.pdf_info_text')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Company Info Section */}
              {job.company_details && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3.5 sm:p-4 md:p-5 lg:p-6"
                >
                  <div className={`flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-5 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0 self-center sm:self-auto">
                      {getLogoUrl(job.company_details.logo) ? (
                        <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center p-1 sm:p-1.5 md:p-2 shadow-lg">
                          <img
                            src={getLogoUrl(job.company_details.logo)}
                            alt={job.company_details.company_name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_details.company_name || 'Company')}&background=ffffff&color=3b82f6&size=80&rounded=true&bold=true`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-lg">
                          {job.company_details.company_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex-1 min-w-0 text-center sm:text-left ${isRTL ? 'sm:text-right' : ''}`}>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-1.5 md:mb-2">
                        {t('jobDetail.about_company', { company: job.company_details.company_name })}
                      </h3>
                      {job.company_details.description && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4 leading-relaxed break-words">
                          {job.company_details.description}
                        </p>
                      )}
                      <div className={`flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center sm:justify-start text-xs sm:text-sm ${isRTL ? 'sm:justify-end' : ''}`}>
                        {job.company_details.website && (
                          <a
                            href={job.company_details.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                          >
                            <HiGlobeAlt className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>{t('jobDetail.website')}</span>
                          </a>
                        )}
                        {job.company_details.email && (
                          <span className={`inline-flex items-center gap-1 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <HiMail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline truncate max-w-[150px]">{job.company_details.email}</span>
                          </span>
                        )}
                        {job.company_details.phone && (
                          <span className={`inline-flex items-center gap-1 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <HiPhone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline">{job.company_details.phone}</span>
                          </span>
                        )}
                        {job.company_details.address && (
                          <span className={`inline-flex items-center gap-1 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <HiLocationMarker className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline truncate max-w-[200px]">{job.company_details.address}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar - Right Side */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Apply Card */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 lg:sticky lg:top-20 transition-all duration-300"
              >
                <div className={`text-center mb-3 sm:mb-4 md:mb-5 ${isRTL ? 'text-right' : ''}`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <HiBriefcase className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">{t('jobDetail.ready_to_apply')}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{t('jobDetail.join_dynamic_team')}</p>
                </div>

                {hasApplied && isAuthenticated ? (
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-xl font-semibold text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {t('jobDetail.application_sent')}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">{t('jobDetail.company_will_review')}</p>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenApplyModal}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 md:py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                  >
                    {t('jobDetail.apply_now')}
                  </motion.button>
                )}

                <div className="mt-4 sm:mt-5 md:mt-6 pt-3 sm:pt-4 md:pt-5 border-t border-gray-100">
                  <div className="space-y-2 sm:space-y-2.5">
                    <div className={`flex items-center justify-between text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-gray-600 flex items-center gap-1 sm:gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <HiCalendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {t('jobDetail.deadline')}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {job.deadline ? formatDate(job.deadline, 'full') : t('jobDetail.not_specified')}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-gray-600 flex items-center gap-1 sm:gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <HiAcademicCap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {t('jobDetail.required_experience')}
                      </span>
                      <span className="font-semibold text-gray-900 text-right">
                        {job.experience_level || job.criteria?.experience || t('jobDetail.not_specified')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* PDF Card - Dans la sidebar */}
              {job.job_description_file && (
                <motion.div
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6"
                >
                  <h3 className={`text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <HiDocumentText className="h-5 w-5 text-blue-600" />
                    {t('jobDetail.job_description')}
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                      <HiDocumentText className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 mb-3">
                        {t('jobDetail.pdf_available')}
                      </p>
                      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <a
                          href={job.job_description_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                        >
                          <HiEye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {t('jobDetail.view')}
                        </a>
                        <a
                          href={job.job_description_file}
                          download
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                        >
                          <HiDocumentDownload className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {t('jobDetail.download')}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Similar Jobs */}
              {similarJobs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6"
                >
                  <h3 className={`text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <HiStar className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                    {t('jobDetail.similar_jobs')}
                  </h3>
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    {similarJobs.map((similarJob, idx) => (
                      <motion.div
                        key={similarJob.id}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                      >
                        <Link
                          to={`/jobs/${similarJob.id}`}
                          className="block p-2 sm:p-2.5 md:p-3 rounded-xl hover:bg-gray-50 transition-all group border border-gray-100 hover:border-blue-200"
                        >
                          <div className={`flex items-start gap-2 sm:gap-2.5 md:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {getLogoUrl(similarJob.company_details?.logo) ? (
                              <img
                                src={getLogoUrl(similarJob.company_details.logo)}
                                alt={similarJob.company_details?.company_name}
                                className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(similarJob.company_details?.company_name || 'Company')}&background=3b82f6&color=ffffff&size=40&rounded=true`;
                                }}
                              />
                            ) : (
                              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                                {similarJob.company_details?.company_name?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-0.5 line-clamp-1 text-xs sm:text-sm">
                                {similarJob.title}
                              </h4>
                              <p className="text-gray-600 text-[10px] sm:text-xs mb-0.5 truncate">{similarJob.company_details?.company_name}</p>
                              <div className={`flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <HiLocationMarker className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                                <span className="truncate">{similarJob.location || t('jobDetail.not_specified')}</span>
                              </div>
                            </div>
                            {getArrowIcon()}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal pour utilisateur connecté */}
      <AnimatePresence>
        {showApplyModal && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => !submitting && !applicationResult && setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {applicationResult ? (
                <div className="text-center p-4 sm:p-6 md:p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                  >
                    <HiCheck className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                    {t('jobDetail.application_sent')}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                    {t('jobDetail.application_for')} <strong>{job.title}</strong> {t('jobDetail.has_been_sent')}
                  </p>
                  <div className={`bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">📋 {t('jobDetail.summary')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">📄 {t('jobDetail.resume')} : {applicationResult.resume_details?.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      📅 {t('jobDetail.date')} : {new Date(applicationResult.applied_date).toLocaleString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-6 text-white sticky top-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{t('jobDetail.apply_to_job')}</h3>
                    <p className="text-blue-100 text-sm sm:text-base">{job.title}</p>
                    <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">{job.company_details?.company_name}</p>
                  </div>

                  <div className={`p-4 sm:p-6 ${isRTL ? 'text-right' : ''}`}>
                    <div className="mb-4 sm:mb-5 md:mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        {t('jobDetail.resume')} *
                      </label>
                      {resumes.length === 0 ? (
                        <div className="bg-yellow-50 rounded-xl p-3 sm:p-4">
                          <p className="text-yellow-800 text-xs sm:text-sm mb-1.5 sm:mb-2">
                            {t('jobDetail.no_resume')}
                          </p>
                          <Link
                            to="/profile/resumes"
                            className="text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-700 inline-flex items-center gap-1"
                          >
                            {t('jobDetail.create_resume')} →
                          </Link>
                        </div>
                      ) : (
                        <select
                          value={selectedResume || ''}
                          onChange={(e) => setSelectedResume(parseInt(e.target.value))}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                        >
                          <option value="">{t('jobDetail.select_resume_option')}</option>
                          {resumes.map((resume) => (
                            <option key={resume.id} value={resume.id}>
                              {resume.title} {resume.is_default && `(${t('jobDetail.default')})`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="mb-4 sm:mb-5 md:mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        {t('jobDetail.cover_letter')} *
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                        placeholder={t('jobDetail.cover_letter_placeholder')}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {coverLetter.length} {t('jobDetail.characters')}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
                      <div className={`flex items-start gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <HiInformationCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-blue-800 font-medium mb-0.5 sm:mb-1">{t('jobDetail.good_to_know')}</p>
                          <p className="text-xs text-blue-700">
                            {t('jobDetail.application_info')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApply}
                        disabled={submitting || resumes.length === 0 || !coverLetter.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {submitting ? (
                          <div className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                            {t('jobDetail.sending')}
                          </div>
                        ) : (
                          t('jobDetail.send_application')
                        )}
                      </motion.button>
                      <button
                        onClick={() => setShowApplyModal(false)}
                        disabled={submitting}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                      >
                        {t('jobDetail.cancel')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal pour utilisateur non connecté */}
      <AnimatePresence>
        {showGuestApplyModal && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => !guestSubmitting && !applicationResult && setShowGuestApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {applicationResult ? (
                <div className="text-center p-4 sm:p-6 md:p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                  >
                    <HiCheck className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                    {t('jobDetail.application_sent')}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                    {t('jobDetail.application_for')} <strong>{job.title}</strong> {t('jobDetail.has_been_sent')}
                  </p>
                  <div className={`bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">📋 {t('jobDetail.summary')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">👤 {t('jobDetail.candidate')} : {applicationResult.candidate_name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">📧 {t('jobDetail.email')} : {applicationResult.candidate_email}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      📅 {t('jobDetail.date')} : {new Date(applicationResult.applied_date).toLocaleString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowGuestApplyModal(false);
                      setApplicationResult(null);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm sm:text-base"
                  >
                    {t('jobDetail.close')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-6 text-white sticky top-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
                      {t('jobDetail.apply_without_account')}
                    </h3>
                    <p className="text-blue-100 text-sm sm:text-base">{job.title}</p>
                    <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">{job.company_details?.company_name}</p>
                  </div>

                  <div className={`p-4 sm:p-6 ${isRTL ? 'text-right' : ''}`}>
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        {t('jobDetail.full_name')} *
                      </label>
                      <input
                        type="text"
                        value={guestFormData.candidate_name}
                        onChange={(e) => setGuestFormData({ ...guestFormData, candidate_name: e.target.value })}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                        placeholder={t('jobDetail.name_placeholder')}
                      />
                    </div>

                    <div className="mb-4 sm:mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        {t('jobDetail.email')} *
                      </label>
                      <input
                        type="email"
                        value={guestFormData.candidate_email}
                        onChange={(e) => setGuestFormData({ ...guestFormData, candidate_email: e.target.value })}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                        placeholder={t('jobDetail.email_placeholder')}
                      />
                    </div>

                    <div className="mb-4 sm:mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        {t('jobDetail.phone')} ({t('jobDetail.optional')})
                      </label>
                      <input
                        type="tel"
                        value={guestFormData.candidate_phone}
                        onChange={(e) => setGuestFormData({ ...guestFormData, candidate_phone: e.target.value })}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                        placeholder={t('jobDetail.phone_placeholder')}
                      />
                    </div>

                    <div className="mb-4 sm:mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        {t('jobDetail.cv_file')} *
                      </label>
                      <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition-colors">
                        <div className="space-y-1 text-center">
                          <HiDocumentText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                          <div className="flex text-xs sm:text-sm text-gray-600">
                            <label
                              htmlFor="cv-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>{t('jobDetail.upload_cv')}</span>
                              <input
                                id="cv-upload"
                                type="file"
                                ref={fileInputRef}
                                className="sr-only"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">{t('jobDetail.or_drag')}</p>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {t('jobDetail.file_types')}
                          </p>
                          {selectedFile && (
                            <p className="text-xs text-green-600 mt-2">
                              ✓ {selectedFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 sm:mb-5 md:mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        {t('jobDetail.cover_letter')} *
                      </label>
                      <textarea
                        value={guestFormData.cover_letter}
                        onChange={(e) => setGuestFormData({ ...guestFormData, cover_letter: e.target.value })}
                        rows={6}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                        placeholder={t('jobDetail.cover_letter_placeholder')}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {guestFormData.cover_letter.length} {t('jobDetail.characters')}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
                      <div className={`flex items-start gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <HiInformationCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-blue-800 font-medium mb-0.5 sm:mb-1">{t('jobDetail.good_to_know')}</p>
                          <p className="text-xs text-blue-700">
                            {t('jobDetail.guest_application_info')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGuestApply}
                        disabled={guestSubmitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {guestSubmitting ? (
                          <div className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                            {t('jobDetail.sending')}
                          </div>
                        ) : (
                          t('jobDetail.send_application')
                        )}
                      </motion.button>
                      <button
                        onClick={() => setShowGuestApplyModal(false)}
                        disabled={guestSubmitting}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                      >
                        {t('jobDetail.cancel')}
                      </button>
                    </div>

                    <div className="text-center mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {t('jobDetail.have_account')}{' '}
                        <button
                          onClick={() => {
                            setShowGuestApplyModal(false);
                            navigate('/login');
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t('jobDetail.login_to_apply_with_profile')}
                        </button>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    
    
    </div>
  );
};

export default JobDetail;