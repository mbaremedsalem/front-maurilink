import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  HiBriefcase, 
  HiUsers, 
  HiDocumentText, 
  HiOfficeBuilding,
  HiChartBar,
  HiUserGroup,
  HiClipboardList,
  HiCurrencyDollar,
  HiCalendar,
  HiStar,
  HiTrendingUp,
  HiArrowRight,
  HiPlusCircle,
  HiEye,
  HiCheckCircle,
  HiClock,
  HiRefresh
} from 'react-icons/hi';
import { jobService } from '../api/services';
import { toast } from 'react-toastify';

const EspaceRecruteur = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user } = useSelector((state) => state.auth);
  
  // Vérifier si l'utilisateur est un recruteur (company)
  const isRecruiter = user?.user_type === 'company';
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active_jobs: 0,
    total_applications: 0,
    views: 0,
    matches: 0
  });

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAll();
      let jobsData = response.data.results || response.data || [];
      
      if (user?.company_id) {
        jobsData = jobsData.filter(job => job.company === user.company_id);
      }
      
      setJobs(jobsData);
      
      const activeJobsCount = jobsData.filter(job => job.status === 'active' || !job.status).length;
      const totalApplications = jobsData.reduce((sum, job) => sum + (job.applications_count || 0), 0);
      
      setStats({
        active_jobs: activeJobsCount,
        total_applications: totalApplications,
        views: jobsData.reduce((sum, job) => sum + (job.views_count || 0), 0),
        matches: 0
      });
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(t('recruiter.errors.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('recruiter.not_specified');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return t('recruiter.not_specified');
    }
  };

  const getArrowIcon = () => {
    if (isRTL) {
      return <span className="transform group-hover:-translate-x-1 transition-transform">←</span>;
    }
    return <span className="transform group-hover:translate-x-1 transition-transform">→</span>;
  };

  const quickActions = [
    {
      title: t('recruiter.quick_actions.manage_jobs.title'),
      description: t('recruiter.quick_actions.manage_jobs.description'),
      icon: HiBriefcase,
      link: '/my-jobs',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      title: t('recruiter.quick_actions.view_applications.title'),
      description: t('recruiter.quick_actions.view_applications.description'),
      icon: HiUsers,
      link: '/applications',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: t('recruiter.quick_actions.rfps.title'),
      description: t('recruiter.quick_actions.rfps.description'),
      icon: HiClipboardList,
      link: '/my-rfps',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const statsDisplay = [
    { number: stats.active_jobs.toString(), label: t('recruiter.stats.active_jobs'), icon: HiBriefcase, color: 'blue' },
    { number: stats.total_applications.toString(), label: t('recruiter.stats.total_applications'), icon: HiUsers, color: 'green' },
    { number: stats.views.toString(), label: t('recruiter.stats.views'), icon: HiEye, color: 'purple' },
    { number: stats.matches.toString(), label: t('recruiter.stats.matches'), icon: HiCheckCircle, color: 'orange' },
  ];

  const featuredJobs = jobs.slice(0, 2);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 ${isRTL ? 'text-right' : ''}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-center ${isRTL ? 'text-right' : 'text-center'}`}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <HiOfficeBuilding className="w-4 h-4" />
              {t('recruiter.badge')}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t('recruiter.title')}
            </h1>
            <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto">
              {t('recruiter.subtitle')}
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.2 }
              }
            }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12"
          >
            {statsDisplay.map((stat, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
                }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-${stat.color}-500/20 rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`h-5 w-5 md:h-6 md:w-6 text-${stat.color}-300`} />
                </div>
                <p className="text-xl md:text-2xl font-bold">
                  {loading ? '...' : stat.number}
                </p>
                <p className="text-xs md:text-sm text-blue-100">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* ✅ Quick Actions Grid - UNIQUEMENT pour les recruteurs */}
        {isRecruiter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HiStar className="h-6 w-6 text-blue-600" />
              {t('recruiter.quick_actions.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`${action.bgColor} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group`}
                >
                  <Link to={action.link} className="block p-5">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold ${action.textColor} mb-2`}>
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {action.description}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${action.textColor} group-hover:gap-2 transition-all`}>
                      {t('recruiter.quick_actions.get_started')}
                      {getArrowIcon()}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Featured Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <HiTrendingUp className="h-6 w-6 text-blue-600" />
              {t('recruiter.featured_jobs.title')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={fetchCompanyJobs}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <HiRefresh className="h-4 w-4" />
                {t('recruiter.refresh')}
              </button>
              <Link 
                to="/my-jobs" 
                className={`text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {t('recruiter.featured_jobs.view_all')}
                {getArrowIcon()}
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">{t('recruiter.loading')}</p>
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-5">
                    <div className={`flex justify-between items-start mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {job.company_details?.company_name || job.company_name || 'Entreprise'}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        {job.status === 'active' ? t('recruiter.featured_jobs.active') : t('recruiter.featured_jobs.closed')}
                      </span>
                    </div>
                    
                    <div className={`flex flex-wrap gap-4 mb-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center gap-1 text-gray-500">
                        <HiOfficeBuilding className="h-4 w-4" />
                        <span>{job.location || t('recruiter.not_specified')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <HiUsers className="h-4 w-4" />
                        <span>{job.applications_count || 0} {t('recruiter.featured_jobs.applications')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <HiCalendar className="h-4 w-4" />
                        <span>{formatDate(job.published_date)}</span>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/jobs/${job.id}`}
                      className={`inline-flex items-center gap-2 text-blue-600 font-medium text-sm hover:text-blue-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      {t('recruiter.featured_jobs.manage')}
                      {getArrowIcon()}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500">{t('recruiter.featured_jobs.no_jobs')}</p>
            </div>
          )}
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8"
        >
          <div className={`flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                <HiStar className="h-4 w-4" />
                {t('recruiter.tips.badge')}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                {t('recruiter.tips.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('recruiter.tips.description')}
              </p>
              <ul className={`space-y-2 ${isRTL ? 'pr-5' : 'pl-5'}`}>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <HiCheckCircle className="h-4 w-4 text-green-500" />
                  {t('recruiter.tips.tip1')}
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <HiCheckCircle className="h-4 w-4 text-green-500" />
                  {t('recruiter.tips.tip2')}
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <HiCheckCircle className="h-4 w-4 text-green-500" />
                  {t('recruiter.tips.tip3')}
                </li>
              </ul>
            </div>
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <HiTrendingUp className="h-12 w-12 md:h-16 md:w-16 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EspaceRecruteur;