import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { rfpService } from '../api/services';
import { 
  HiPlus, 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiClock,
  HiUsers,
  HiDocumentText,
  HiOfficeBuilding,
  HiLocationMarker,
  HiCurrencyDollar,
  HiCalendar,
  HiBriefcase
} from 'react-icons/hi';
import { toast } from 'react-toastify';

const MyRFPs = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRfps();
  }, []);

  const fetchMyRfps = async () => {
    try {
      setLoading(true);
      const response = await rfpService.getMyRfps();
      const rfpsData = response.data.results || response.data;
      setRfps(rfpsData);
    } catch (error) {
      console.error('Error fetching my RFPs:', error);
      toast.error(t('myRfps.errors.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'https://back.maurilink.site';
    return `${baseUrl}${logoPath}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('myRfps.confirm_delete'))) {
      try {
        await rfpService.delete(id);
        toast.success(t('myRfps.success.delete_success'));
        fetchMyRfps();
      } catch (error) {
        console.error('Error deleting RFP:', error);
        toast.error(t('myRfps.errors.delete_error'));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('myRfps.not_specified');
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (rfp) => {
    if (rfp.status === 'closed') {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
          {t('myRfps.status.closed')}
        </span>
      );
    }
    if (rfp.remaining_days <= 0) {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
          {t('myRfps.status.expired')}
        </span>
      );
    }
    if (rfp.remaining_days <= 3) {
      return (
        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
          🔥 {t('myRfps.status.urgent')} - {rfp.remaining_days}{t('myRfps.status.days')}
        </span>
      );
    }
    return (
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
        {t('myRfps.status.open')} - {rfp.remaining_days}{t('myRfps.status.days')}
      </span>
    );
  };

  // Helper pour la direction RTL
  const getArrowIcon = () => {
    if (isRTL) {
      return <span className="transform group-hover:-translate-x-1 transition-transform">←</span>;
    }
    return <span className="transform group-hover:translate-x-1 transition-transform">→</span>;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 via-white to-blue-50 ${isRTL ? 'text-right' : ''}`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">{t('myRfps.loading')}</p>
        </div>
      </div>
    );
  }

  const openCount = rfps.filter(r => r.status === 'open' && r.remaining_days > 0).length;
  const proposalsCount = rfps.reduce((sum, rfp) => sum + (rfp.proposals_count || 0), 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 ${isRTL ? 'text-right' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`flex flex-wrap justify-between items-center gap-4 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('myRfps.title')}</h1>
            <p className="text-gray-600 mt-1">{t('myRfps.subtitle')}</p>
          </div>
          <Link
            to="/create-rfp"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            <HiPlus className="w-5 h-5" />
            {t('myRfps.create_button')}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-gray-500 text-sm">{t('myRfps.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{rfps.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <HiDocumentText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-gray-500 text-sm">{t('myRfps.stats.open')}</p>
                <p className="text-2xl font-bold text-green-600">{openCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <HiClock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-gray-500 text-sm">{t('myRfps.stats.proposals')}</p>
                <p className="text-2xl font-bold text-purple-600">{proposalsCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <HiUsers className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* RFPs List */}
        {rfps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <HiDocumentText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('myRfps.no_rfps.title')}</p>
            <Link to="/create-rfp" className="text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1">
              {t('myRfps.no_rfps.create_first')}
              {getArrowIcon()}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rfps.map((rfp) => (
              <motion.div
                key={rfp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Section Logo */}
                <div className="relative h-40 bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden">
                  {rfp.company_logo ? (
                    <>
                      <img
                        src={getLogoUrl(rfp.company_logo)}
                        alt={rfp.company_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rfp.company_name || 'Company')}&background=3b82f6&color=ffffff&size=200&rounded=false&bold=true`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white">
                      <HiOfficeBuilding className="w-12 h-12 mb-2 opacity-80" />
                      <p className="text-sm font-medium">{rfp.company_name}</p>
                    </div>
                  )}
                  
                  <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} z-10`}>
                    {getStatusBadge(rfp)}
                  </div>
                  
                  <div className={`absolute bottom-3 ${isRTL ? 'right-3 left-3' : 'left-3 right-3'} z-10`}>
                    <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 inline-block">
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <HiOfficeBuilding className="h-3.5 w-3.5 text-white" />
                        <span className="text-white text-xs font-medium truncate">
                          {rfp.company_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className={`font-semibold text-lg text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {rfp.title}
                  </h3>
                  <p className={`text-gray-600 text-sm mb-3 line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                    {rfp.description}
                  </p>
                  
                  <div className={`space-y-2 mb-4 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiLocationMarker className="w-4 h-4 flex-shrink-0" />
                      <span>{rfp.location || t('myRfps.not_specified')}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiCurrencyDollar className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-green-600">
                        {parseInt(rfp.budget_min).toLocaleString()} - {parseInt(rfp.budget_max).toLocaleString()} MRU
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiCalendar className="w-4 h-4 flex-shrink-0" />
                      <span>{t('myRfps.deadline')}: {formatDate(rfp.submission_deadline)}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiBriefcase className="w-4 h-4 flex-shrink-0" />
                      <span>{rfp.duration || t('myRfps.not_specified')}</span>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between pt-3 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Link
                        to={`/rfps/${rfp.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('myRfps.actions.view')}
                      >
                        <HiEye className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/edit-rfp/${rfp.id}`}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title={t('myRfps.actions.edit')}
                      >
                        <HiPencil className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(rfp.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('myRfps.actions.delete')}
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      {t('myRfps.published_on')} {formatDate(rfp.published_date)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRFPs;