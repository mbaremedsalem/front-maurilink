import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  HiBriefcase, 
  HiLocationMarker, 
  HiCurrencyDollar, 
  HiCalendar,
  HiOfficeBuilding,
  HiUsers,
  HiEye,
  HiPencil,
  HiTrash,
  HiDocumentText,
  HiDownload,
  HiRefresh,
  HiPlusCircle,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiFilter,
  HiSearch
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import api from '../api/axios';

const MyJobs = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user } = useSelector((state) => state.auth);
  
  const [companyData, setCompanyData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContract, setFilterContract] = useState('all');

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs/offers/company/');
      setCompanyData({
        company_name: response.data.company_name,
        total_offers: response.data.total_offers
      });
      setOffers(response.data.offers || []);
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      toast.error(t('myJobs.errors.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm(t('myJobs.confirm_delete'))) {
      try {
        await api.delete(`/jobs/offers/${jobId}/`);
        toast.success(t('myJobs.success.delete_success'));
        fetchCompanyJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error(t('myJobs.errors.delete_error'));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('myJobs.not_specified');
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return t('myJobs.not_specified');
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR').format(salary) + ' MRU';
  };

  const getContractTypeBadge = (type) => {
    const colors = {
      'CDI': 'bg-green-100 text-green-800',
      'CDD': 'bg-blue-100 text-blue-800',
      'STAGE': 'bg-purple-100 text-purple-800',
      'ALTERNANCE': 'bg-orange-100 text-orange-800',
      'FREELANCE': 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return {
        icon: <HiCheckCircle className="h-3 w-3" />,
        text: t('myJobs.status.active'),
        className: 'bg-green-100 text-green-800'
      };
    }
    return {
      icon: <HiXCircle className="h-3 w-3" />,
      text: t('myJobs.status.inactive'),
      className: 'bg-red-100 text-red-800'
    };
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    return `${baseUrl}${logoPath}`;
  };

  // Filtrage des offres
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          offer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && offer.is_active === true) ||
                          (filterStatus === 'inactive' && offer.is_active === false);
    const matchesContract = filterContract === 'all' || offer.contract_type === filterContract;
    return matchesSearch && matchesStatus && matchesContract;
  });

  const contractTypes = ['CDI', 'CDD', 'FREELANCE', 'STAGE', 'ALTERNANCE'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">{t('myJobs.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 ${isRTL ? 'text-right' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}
          >
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <div className="flex items-center gap-3 mb-2">
                {companyData?.company_logo && (
                  <img 
                    src={getLogoUrl(companyData.company_logo)} 
                    alt={companyData.company_name}
                    className="w-12 h-12 rounded-full bg-white p-1"
                  />
                )}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  {t('myJobs.title')}
                </h1>
              </div>
              <p className="text-blue-100">
                {companyData?.company_name} • {t('myJobs.total_offers', { count: companyData?.total_offers || 0 })}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchCompanyJobs}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                title={t('myJobs.refresh')}
              >
                <HiRefresh className="h-5 w-5" />
              </button>
              <Link
                to="/jobs/create"
                className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <HiPlusCircle className="h-5 w-5" />
                {t('myJobs.create_job')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 mb-6"
        >
          <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            {/* Recherche */}
            <div className="flex-1 relative">
              <HiSearch className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} h-5 w-5 text-gray-400`} />
              <input
                type="text"
                placeholder={t('myJobs.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            
            {/* Filtre statut */}
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('myJobs.filter.all_status')}</option>
                <option value="active">{t('myJobs.filter.active')}</option>
                <option value="inactive">{t('myJobs.filter.inactive')}</option>
              </select>
            </div>
            
            {/* Filtre contrat */}
            <div className="w-full md:w-48">
              <select
                value={filterContract}
                onChange={(e) => setFilterContract(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('myJobs.filter.all_contracts')}</option>
                {contractTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Résultats */}
        {filteredOffers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' || filterContract !== 'all' 
                ? t('myJobs.no_results.title') 
                : t('myJobs.no_jobs.title')}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' || filterContract !== 'all'
                ? t('myJobs.no_results.subtitle')
                : t('myJobs.no_jobs.subtitle')}
            </p>
            {(searchTerm || filterStatus !== 'all' || filterContract !== 'all') ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterContract('all');
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('myJobs.clear_filters')}
              </button>
            ) : (
              <Link
                to="/jobs/create"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <HiPlusCircle className="h-5 w-5" />
                {t('myJobs.create_first')}
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">
              {t('myJobs.showing_results', { count: filteredOffers.length, total: offers.length })}
            </p>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence>
                {filteredOffers.map((offer) => {
                  const status = getStatusBadge(offer.is_active);
                  return (
                    <motion.div
                      key={offer.id}
                      variants={itemVariants}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
                    >
                      <div className="p-5">
                        <div className={`flex flex-col md:flex-row justify-between items-start gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                          {/* Info principale */}
                          <div className="flex-1">
                            <div className={`flex flex-wrap items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <h3 className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                <Link to={`/jobs/${offer.id}`}>{offer.title}</Link>
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                                {status.icon}
                                {status.text}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getContractTypeBadge(offer.contract_type)}`}>
                                {offer.contract_type}
                              </span>
                            </div>
                            
                            <div className={`flex flex-wrap gap-3 mb-3 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="flex items-center gap-1">
                                <HiOfficeBuilding className="h-4 w-4" />
                                <span>{offer.company_details?.company_name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HiLocationMarker className="h-4 w-4" />
                                <span>{offer.location || t('myJobs.not_specified')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HiCurrencyDollar className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-600">
                                  {formatSalary(offer.salary_min)} - {formatSalary(offer.salary_max)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HiCalendar className="h-4 w-4" />
                                <span>{formatDate(offer.published_date)}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {offer.description}
                            </p>
                            
                            {/* Compétences */}
                            {offer.criteria?.skills && offer.criteria.skills.length > 0 && (
                              <div className={`flex flex-wrap gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {offer.criteria.skills.slice(0, 4).map((skill, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {skill}
                                  </span>
                                ))}
                                {offer.criteria.skills.length > 4 && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    +{offer.criteria.skills.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Link
                              to={`/jobs/${offer.id}`}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={t('myJobs.actions.view')}
                            >
                              <HiEye className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/edit-job/${offer.id}`}
                              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title={t('myJobs.actions.edit')}
                            >
                              <HiPencil className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => deleteJob(offer.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('myJobs.actions.delete')}
                            >
                              <HiTrash className="h-5 w-5" />
                            </button>
                            {offer.job_description_file && (
                              <a
                                href={offer.job_description_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title={t('myJobs.actions.download')}
                              >
                                <HiDownload className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyJobs;