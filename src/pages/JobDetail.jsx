import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  HiArrowRight
} from 'react-icons/hi';
import { HiBuildingOffice2 } from 'react-icons/hi2';
import { toast } from 'react-toastify';

const JobDetail = () => {
  const { id } = useParams();
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

  const isAuthenticated = !!localStorage.getItem('access_token');

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'https://142.93.61.53';
    return `${baseUrl}${logoPath}`;
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
      toast.error("Impossible de charger l'offre d'emploi");
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
    setSaved(!saved);
    toast.success(saved ? 'Offre retirée des favoris' : 'Offre ajoutée aux favoris');
  };

const handleShare = async () => {
  // Méthode 1: Utiliser l'API Clipboard moderne
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard API failed:', err);
      return false;
    }
  };

  // Méthode 2: Méthode de secours avec textarea
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
    toast.success('Lien copié dans le presse-papier !');
  } else {
    // Méthode 3: Afficher le lien manuellement
    toast.error('Impossible de copier automatiquement. Voici le lien : ' + url, {
      autoClose: 5000,
      closeButton: true,
    });
  }
};
  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.warning('Veuillez vous connecter pour postuler');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    if (!selectedResume) {
      toast.warning('Veuillez sélectionner un CV');
      return;
    }

    if (!coverLetter.trim()) {
      toast.warning('Veuillez ajouter une lettre de motivation');
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
      
      toast.success('Candidature envoyée avec succès !');
      
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
                          'Une erreur est survenue lors de la candidature';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR').format(salary) + ' MRU';
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Offre non trouvée</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 md:mb-7 lg:mb-8">L'offre que vous recherchez n'existe pas ou a été supprimée</p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
          >
            <HiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            Retour aux offres
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Sticky Navigation Bar - Alignée avec les autres pages */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4">
          <div className="flex justify-between items-center">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-blue-600 transition-colors group text-sm sm:text-base"
            >
              <HiArrowLeft className="group-hover:-translate-x-1 transition-transform h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
              <span className="hidden xs:inline">Retour aux offres</span>
            </Link>
            <div className="flex gap-1.5 sm:gap-2 md:gap-2.5">
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

      {/* Main Content Container - Largeur et padding cohérents */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-7 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {/* Main Content - Left Side (2/3 sur desktop) */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Job Header Card - Responsive complet */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Header avec gradient et logo */}
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-4 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 md:py-7 lg:py-10 text-white relative overflow-hidden">
                    {/* Effets décoratifs responsives */}
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 md:-mr-20 md:-mt-20 lg:-mr-24 lg:-mt-24"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-white/10 rounded-full -ml-12 -mb-12 sm:-ml-16 sm:-mb-16 md:-ml-20 md:-mb-20 lg:-ml-24 lg:-mb-24"></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 items-start xs:items-center">
                        {/* Logo responsive */}
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
                        
                        <div className="flex-1 text-center xs:text-left w-full">
                          {/* Badges responsives */}
                          <div className="flex flex-wrap items-center justify-center xs:justify-start gap-1 sm:gap-1.5 md:gap-2 mb-1.5 sm:mb-2 md:mb-2.5">
                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-xs font-semibold ${getContractTypeColor(job.contract_type)}`}>
                              {getContractTypeIcon(job.contract_type)}
                              <span className="hidden xs:inline">{job.contract_type || 'Non spécifié'}</span>
                            </span>
                            {job.is_urgent && (
                              <span className="bg-red-500 text-white px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1">
                                <HiClock className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                <span className="hidden xs:inline">Urgent</span>
                              </span>
                            )}
                            {job.featured && (
                              <span className="bg-yellow-400 text-gray-900 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1">
                                <HiStar className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                <span className="hidden xs:inline">Featured</span>
                              </span>
                            )}
                          </div>
                          <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-1.5 md:mb-2 break-words leading-tight">
                            {job.title}
                          </h1>
                          <div className="flex items-center justify-center xs:justify-start gap-1 sm:gap-1.5 md:gap-2 text-blue-100 text-xs sm:text-sm md:text-base">
                            <HiOfficeBuilding className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                            <p className="truncate">{job.company_details?.company_name || 'Entreprise'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Bar - Grid responsive */}
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 p-3 sm:p-3.5 md:p-4 border-b border-gray-100 bg-gray-50/50">
                  {[
                    { icon: HiLocationMarker, label: 'Localisation', value: job.location || 'Non spécifiée', color: 'blue' },
                    { icon: HiCurrencyEuro, label: 'Salaire', value: job.salary_min && job.salary_max ? `${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()}` : 'Non spécifié', color: 'green' },
                    { icon: HiCalendar, label: 'Publiée le', value: new Date(job.published_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), color: 'purple' },
                    { icon: HiUserGroup, label: 'Candidatures', value: job.applications_count || 0, color: 'orange' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
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

                {/* Tabs - Scrollable horizontal sur mobile */}
                <div className="border-b border-gray-200 px-3 sm:px-4 md:px-6 overflow-x-auto">
                  <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-w-max">
                    {[
                      { id: 'description', label: 'Description', icon: HiInformationCircle },
                      { id: 'requirements', label: 'Prérequis', icon: HiBadgeCheck },
                      { id: 'benefits', label: 'Avantages', icon: HiStar }
                    ].map((tab) => (
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

                {/* Tab Content - Padding responsive */}
                <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                  {activeTab === 'description' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose max-w-none"
                    >
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
                        <HiInformationCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                        Description du poste
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
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
                        <HiBadgeCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                        Compétences et prérequis
                      </h3>
                      
                      {job.criteria?.skills && job.criteria.skills.length > 0 && (
                        <div className="mb-4 sm:mb-5 md:mb-6">
                          <h4 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-2.5 text-sm sm:text-base">Compétences techniques</h4>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                            return (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-1.5 sm:gap-2 md:gap-2.5 p-2 sm:p-2.5 md:p-3 bg-gray-50 rounded-lg"
                              >
                                <HiBadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 text-green-500 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <dt className="text-xs sm:text-sm font-medium text-gray-900">
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
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
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
                        <HiStar className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                        Avantages
                      </h3>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2 md:gap-2.5">
                        {[
                          { icon: HiTrendingUp, label: 'Évolution de carrière', color: 'green' },
                          { icon: HiOfficeBuilding, label: 'Environnement pro', color: 'blue' },
                          { icon: HiCalendar, label: 'Congés payés', color: 'purple' },
                          { icon: HiCurrencyEuro, label: 'Mutuelle', color: 'orange' },
                          { icon: HiUsers, label: 'Équipe dynamique', color: 'red' },
                          { icon: HiLightBulb, label: 'Formation continue', color: 'yellow' }
                        ].map((benefit, idx) => (
                          <div key={idx} className={`flex items-center gap-1.5 sm:gap-2 md:gap-2.5 p-1.5 sm:p-2 md:p-2.5 bg-${benefit.color}-50 rounded-lg hover:shadow-md transition-shadow`}>
                            <benefit.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 text-${benefit.color}-600 flex-shrink-0`} />
                            <span className="text-gray-700 text-xs sm:text-sm capitalize">{benefit.label}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Company Info Section - Responsive */}
              {job.company_details && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3.5 sm:p-4 md:p-5 lg:p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-5">
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
                    
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-1.5 md:mb-2">
                        À propos de {job.company_details.company_name}
                      </h3>
                      {job.company_details.description && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4 leading-relaxed break-words">
                          {job.company_details.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center sm:justify-start text-xs sm:text-sm">
                        {job.company_details.website && (
                          <a
                            href={job.company_details.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <HiGlobeAlt className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>Site web</span>
                          </a>
                        )}
                        {job.company_details.email && (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <HiMail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline truncate max-w-[150px]">{job.company_details.email}</span>
                          </span>
                        )}
                        {job.company_details.phone && (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <HiPhone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden xs:inline">{job.company_details.phone}</span>
                          </span>
                        )}
                        {job.company_details.address && (
                          <span className="inline-flex items-center gap-1 text-gray-600">
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

            {/* Sidebar - Right Side (1/3 sur desktop) - Sticky responsive */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Apply Card - Sticky sur desktop */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 lg:sticky lg:top-20 transition-all duration-300"
              >
                <div className="text-center mb-3 sm:mb-4 md:mb-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <HiBriefcase className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">Prêt à postuler ?</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Rejoignez une équipe dynamique</p>
                </div>

                {hasApplied ? (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-xl font-semibold text-xs sm:text-sm">
                      <HiCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Candidature envoyée
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">L'entreprise examinera votre profil</p>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowApplyModal(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 md:py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                  >
                    Postuler maintenant
                  </motion.button>
                )}

                <div className="mt-4 sm:mt-5 md:mt-6 pt-3 sm:pt-4 md:pt-5 border-t border-gray-100">
                  <div className="space-y-2 sm:space-y-2.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 flex items-center gap-1 sm:gap-1.5">
                        <HiCalendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Date limite
                      </span>
                      <span className="font-semibold text-gray-900">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 flex items-center gap-1 sm:gap-1.5">
                        <HiAcademicCap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Expérience requise
                      </span>
                      <span className="font-semibold text-gray-900 text-right">
                        {job.experience_level || job.criteria?.experience || 'Non spécifiée'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Similar Jobs - Responsive */}
              {similarJobs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6"
                >
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                    <HiStar className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600" />
                    Offres similaires
                  </h3>
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    {similarJobs.map((similarJob, idx) => (
                      <motion.div
                        key={similarJob.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                      >
                        <Link
                          to={`/jobs/${similarJob.id}`}
                          className="block p-2 sm:p-2.5 md:p-3 rounded-xl hover:bg-gray-50 transition-all group border border-gray-100 hover:border-blue-200"
                        >
                          <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
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
                              <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs">
                                <HiLocationMarker className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                                <span className="truncate">{similarJob.location || 'Non spécifiée'}</span>
                              </div>
                            </div>
                            <HiArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
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

      {/* Apply Modal - Déjà responsive */}
      <AnimatePresence>
        {showApplyModal && (
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
                    Candidature envoyée !
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                    Votre candidature pour <strong>{job.title}</strong> a bien été envoyée.
                  </p>
                  <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">📋 Récapitulatif</p>
                    <p className="text-xs sm:text-sm text-gray-600">📄 CV : {applicationResult.resume_details?.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      📅 Date : {new Date(applicationResult.applied_date).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-6 text-white sticky top-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">Postuler à l'offre</h3>
                    <p className="text-blue-100 text-sm sm:text-base">{job.title}</p>
                    <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">{job.company_details?.company_name}</p>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="mb-4 sm:mb-5 md:mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        CV *
                      </label>
                      {resumes.length === 0 ? (
                        <div className="bg-yellow-50 rounded-xl p-3 sm:p-4">
                          <p className="text-yellow-800 text-xs sm:text-sm mb-1.5 sm:mb-2">
                            Vous n'avez pas encore de CV.
                          </p>
                          <Link
                            to="/profile/resumes"
                            className="text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-700 inline-flex items-center gap-1"
                          >
                            Créer mon CV →
                          </Link>
                        </div>
                      ) : (
                        <select
                          value={selectedResume || ''}
                          onChange={(e) => setSelectedResume(parseInt(e.target.value))}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                          <option value="">Sélectionnez un CV</option>
                          {resumes.map((resume) => (
                            <option key={resume.id} value={resume.id}>
                              {resume.title} {resume.is_default && '(Par défaut)'}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="mb-4 sm:mb-5 md:mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Lettre de motivation *
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        placeholder="Décrivez votre motivation, vos compétences et pourquoi vous êtes le candidat idéal..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {coverLetter.length} caractères
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <HiInformationCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-blue-800 font-medium mb-0.5 sm:mb-1">À savoir</p>
                          <p className="text-xs text-blue-700">
                            Votre candidature sera examinée par l'équipe recrutement. 
                            Assurez-vous que votre CV est à jour.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApply}
                        disabled={submitting || resumes.length === 0 || !coverLetter.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {submitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                            Envoi en cours...
                          </div>
                        ) : (
                          'Envoyer ma candidature'
                        )}
                      </motion.button>
                      <button
                        onClick={() => setShowApplyModal(false)}
                        disabled={submitting}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                      >
                        Annuler
                      </button>
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