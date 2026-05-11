import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { rfpService } from '../api/services';
import { 
  HiArrowLeft, 
  HiUserCircle, 
  HiMail, 
  HiDocumentDownload,
  HiCheck,
  HiX,
  HiEye,
  HiBriefcase,
  HiCalendar,
  HiCurrencyDollar,
  HiClock
} from 'react-icons/hi';
import { toast } from 'react-toastify';

const CompanyProposals = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user } = useSelector((state) => state.auth);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.user_type === 'company') {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await rfpService.getCompanyProposals();
      const proposalsData = response.data.results || response.data;
      setProposals(proposalsData);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error(t('companyProposals.errors.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const updateProposalStatus = async (proposalId, status) => {
    try {
      await rfpService.updateProposalStatus(proposalId, { status });
      toast.success(status === 'accepted' 
        ? t('companyProposals.messages.accepted') 
        : t('companyProposals.messages.rejected'));
      fetchProposals();
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error(t('companyProposals.errors.status_update_error'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('companyProposals.unknown_date');
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
        label: t('companyProposals.status.pending'), 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      accepted: { 
        label: t('companyProposals.status.accepted'), 
        color: 'bg-green-100 text-green-800 border-green-200' 
      },
      rejected: { 
        label: t('companyProposals.status.rejected'), 
        color: 'bg-red-100 text-red-800 border-red-200' 
      },
      reviewed: { 
        label: t('companyProposals.status.reviewed'), 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    return proposal.status === filter;
  });

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length
  };

  // Helper pour la direction RTL
  const getArrowIcon = () => {
    if (isRTL) {
      return <span className="transform group-hover:-translate-x-1 transition-transform">←</span>;
    }
    return <span className="transform group-hover:translate-x-1 transition-transform">→</span>;
  };

  if (user?.user_type !== 'company') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 ${isRTL ? 'text-right' : ''}`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiX className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('companyProposals.unauthorized.title')}</h2>
          <p className="text-gray-600">{t('companyProposals.unauthorized.subtitle')}</p>
          <Link to="/" className="inline-block mt-4 text-blue-600 hover:text-blue-700">
            {t('companyProposals.unauthorized.back_home')}
          </Link>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { value: 'all', label: t('companyProposals.filters.all') },
    { value: 'pending', label: t('companyProposals.filters.pending') },
    { value: 'accepted', label: t('companyProposals.filters.accepted') },
    { value: 'rejected', label: t('companyProposals.filters.rejected') }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 ${isRTL ? 'text-right' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/" 
          className={`inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <HiArrowLeft className={`group-hover:${isRTL ? 'translate-x-1' : '-translate-x-1'} transition-transform ${isRTL ? 'rotate-180' : ''}`} />
          {t('companyProposals.back')}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('companyProposals.title')}</h1>
          <p className="text-gray-600 mt-1">{t('companyProposals.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-gray-500 text-sm">{t('companyProposals.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <HiBriefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-gray-500 text-sm">{t('companyProposals.stats.pending')}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <HiClock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-gray-500 text-sm">{t('companyProposals.stats.accepted')}</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <HiCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-gray-500 text-sm">{t('companyProposals.stats.rejected')}</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <HiX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`flex gap-2 mb-6 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">{t('companyProposals.loading')}</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiDocumentDownload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">{t('companyProposals.no_proposals')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
              >
                <div className={`flex flex-wrap justify-between items-start gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <HiUserCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <h3 className="font-semibold text-gray-900">{proposal.candidate_name}</h3>
                        <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <HiMail className="w-3.5 h-3.5" />
                          <span>{proposal.candidate_email}</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      to={`/rfps/${proposal.rfp}`}
                      className={`text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <HiEye className="w-3.5 h-3.5" />
                      {t('companyProposals.view_rfp')}
                      {getArrowIcon()}
                    </Link>
                  </div>
                  <div className={`flex flex-col gap-2 ${isRTL ? 'items-start' : 'items-end'}`}>
                    {getStatusBadge(proposal.status)}
                    <span className="text-xs text-gray-400">
                      {t('companyProposals.submitted_on')} {formatDate(proposal.submitted_date)}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">{t('companyProposals.rfp_title')}</p>
                  <p className="text-gray-900">{proposal.rfp_title}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('companyProposals.proposed_amount')}</p>
                    <p className="font-semibold text-green-600">{parseInt(proposal.proposed_amount).toLocaleString()} MRU</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('companyProposals.proposed_timeline')}</p>
                    <p className="font-semibold text-blue-600">{proposal.proposed_timeline}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">{t('companyProposals.cover_letter')}</p>
                  <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">
                    {proposal.cover_letter}
                  </p>
                </div>

                {proposal.proposal_document && (
                  <div className="mb-4">
                    <a
                      href={proposal.proposal_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <HiDocumentDownload className="w-4 h-4" />
                      {t('companyProposals.download_document')}
                    </a>
                  </div>
                )}

                {proposal.notes && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{t('companyProposals.recruiter_notes')}</p>
                    <p className="text-sm text-gray-700">{proposal.notes}</p>
                  </div>
                )}

                {proposal.status === 'pending' && (
                  <div className={`flex gap-3 pt-3 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => updateProposalStatus(proposal.id, 'accepted')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <HiCheck className="w-4 h-4 inline mr-1" />
                      {t('companyProposals.accept')}
                    </button>
                    <button
                      onClick={() => updateProposalStatus(proposal.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <HiX className="w-4 h-4 inline mr-1" />
                      {t('companyProposals.reject')}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProposals;