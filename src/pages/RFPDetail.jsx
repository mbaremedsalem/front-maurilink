import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { rfpService } from '../api/services';
import { 
  HiArrowLeft, 
  HiLocationMarker, 
  HiCurrencyDollar, 
  HiCalendar, 
  HiBriefcase,
  HiOfficeBuilding,
  HiClock,
  HiDocumentDownload,
  HiDocumentText,
  HiCheckCircle,
  HiUpload,
  HiX,
  HiExternalLink,
  HiUserCircle,
  HiMail,
  HiPhone,
  HiCheck,
  HiEye
} from 'react-icons/hi';
import { toast } from 'react-toastify';

const RFPDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showProposalsList, setShowProposalsList] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proposalData, setProposalData] = useState({
    cover_letter: '',
    proposed_amount: '',
    proposed_timeline: '',
    proposal_document: null
  });

  useEffect(() => {
    fetchRfp();
    if (user?.user_type === 'company') {
      fetchProposals();
    }
    window.scrollTo(0, 0);
  }, [id, user]);

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://142.93.61.53';
    return `${baseUrl}${logoPath}`;
  };

  const fetchRfp = async () => {
    try {
      setLoading(true);
      const response = await rfpService.getById(id);
      setRfp(response.data);
    } catch (error) {
      console.error('Error fetching RFP:', error);
      toast.error('Impossible de charger l\'appel d\'offres');
      navigate('/rfps');
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      setLoadingProposals(true);
      const response = await rfpService.getCompanyProposals();
      const proposalsData = response.data.results || response.data;
      // Filtrer les propositions pour cet appel d'offres
      const rfpProposals = proposalsData.filter(p => p.rfp === parseInt(id));
      setProposals(rfpProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Veuillez vous connecter pour soumettre une proposition');
      navigate('/login');
      return;
    }

    if (user?.user_type !== 'candidate') {
      toast.warning('Seuls les candidats peuvent soumettre des propositions');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('rfp', id);
    formData.append('cover_letter', proposalData.cover_letter);
    formData.append('proposed_amount', proposalData.proposed_amount);
    formData.append('proposed_timeline', proposalData.proposed_timeline);
    if (proposalData.proposal_document) {
      formData.append('proposal_document', proposalData.proposal_document);
    }

    try {
      await rfpService.submitProposal(formData);
      toast.success('Proposition soumise avec succès !');
      setShowProposalModal(false);
      setProposalData({
        cover_letter: '',
        proposed_amount: '',
        proposed_timeline: '',
        proposal_document: null
      });
    } catch (error) {
      console.error('Error submitting proposal:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          'Erreur lors de la soumission de la proposition';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800 border-red-200' },
      reviewed: { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
  };

  const getRFPStatusBadge = () => {
    if (!rfp) return null;
    if (rfp.status === 'closed') {
      return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Fermé</span>;
    }
    if (rfp.remaining_days <= 0) {
      return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Expiré</span>;
    }
    if (rfp.remaining_days <= 3) {
      return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">🔥 Urgent - {rfp.remaining_days} jours restants</span>;
    }
    return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Ouvert - {rfp.remaining_days} jours restants</span>;
  };

  const updateProposalStatus = async (proposalId, status) => {
    try {
      await rfpService.updateProposalStatus(proposalId, { status });
      toast.success(`Proposition ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès`);
      fetchProposals();
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!rfp) return null;

  const canSubmitProposal = rfp.status === 'open' && rfp.remaining_days > 0 && user?.user_type === 'candidate';
  const isCompany = user?.user_type === 'company';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/rfps"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group mb-6"
        >
          <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Retour aux appels d'offres
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header avec logo */}
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-6 md:px-8 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-shrink-0">
                      {rfp.company_logo ? (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-lg overflow-hidden flex items-center justify-center p-2">
                          <img
                            src={getLogoUrl(rfp.company_logo)}
                            alt={rfp.company_name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rfp.company_name || 'Company')}&background=ffffff&color=3b82f6&size=120&rounded=true&bold=true`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                          <HiOfficeBuilding className="h-10 w-10 md:h-12 md:w-12 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                          {rfp.contract_type}
                        </span>
                        {getRFPStatusBadge()}
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">{rfp.title}</h1>
                      <div className="flex items-center gap-2 text-blue-100">
                        <HiOfficeBuilding className="h-5 w-5" />
                        <p className="text-lg">{rfp.company_name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4">
                  <HiLocationMarker className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Localisation</p>
                  <p className="font-semibold text-gray-900">{rfp.location}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <HiCurrencyDollar className="h-5 w-5 text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold text-gray-900">
                    {parseInt(rfp.budget_min).toLocaleString()} - {parseInt(rfp.budget_max).toLocaleString()} MRU
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <HiCalendar className="h-5 w-5 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">Date limite</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(rfp.submission_deadline).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <HiBriefcase className="h-5 w-5 text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="font-semibold text-gray-900">{rfp.duration}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description du projet</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{rfp.description}</p>
              </div>

              {/* Requirements */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Prérequis</h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{rfp.requirements}</p>
                </div>
              </div>

              {/* Criteria */}
              {rfp.criteria && Object.keys(rfp.criteria).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Critères d'évaluation</h2>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <dl className="space-y-3">
                      {Object.entries(rfp.criteria).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-gray-500">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                          </dt>
                          <dd className="text-gray-900 font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {/* Attachment */}
              {rfp.attachment && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Documents joints</h2>
                  <a
                    href={rfp.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg"
                  >
                    <HiDocumentDownload className="h-5 w-5" />
                    Télécharger le fichier
                  </a>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-4 justify-center pt-6 border-t border-gray-200">
                {canSubmitProposal && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProposalModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Soumettre une proposition
                  </motion.button>
                )}
                
                {isCompany && proposals.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProposalsList(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Voir les propositions ({proposals.length})
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de soumission de proposition */}
      <AnimatePresence>
        {showProposalModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white sticky top-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Soumettre une proposition</h3>
                  <button onClick={() => setShowProposalModal(false)} className="p-1 hover:bg-white/20 rounded-lg">
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-blue-100 text-sm mt-1">{rfp.title}</p>
              </div>

              <form onSubmit={handleProposalSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lettre de motivation *
                  </label>
                  <textarea
                    required
                    rows="6"
                    value={proposalData.cover_letter}
                    onChange={(e) => setProposalData({...proposalData, cover_letter: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Présentez-vous, expliquez votre expérience et pourquoi vous êtes le bon candidat..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant proposé (MRU) *
                    </label>
                    <input
                      type="number"
                      required
                      value={proposalData.proposed_amount}
                      onChange={(e) => setProposalData({...proposalData, proposed_amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 20000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Délai proposé *
                    </label>
                    <input
                      type="text"
                      required
                      value={proposalData.proposed_timeline}
                      onChange={(e) => setProposalData({...proposalData, proposed_timeline: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 2.5 mois"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document de proposition (CV, portfolio...)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setProposalData({...proposalData, proposal_document: e.target.files[0]})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Envoi en cours...' : 'Envoyer la proposition'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de visualisation des propositions (pour les entreprises) */}
      <AnimatePresence>
        {showProposalsList && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Propositions reçues</h3>
                    <p className="text-emerald-100 text-sm mt-1">{rfp.title}</p>
                  </div>
                  <button onClick={() => setShowProposalsList(false)} className="p-1 hover:bg-white/20 rounded-lg">
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {loadingProposals ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Chargement des propositions...</p>
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <HiDocumentText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Aucune proposition reçue pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <HiUserCircle className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{proposal.candidate_name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <HiMail className="w-3.5 h-3.5" />
                                  <span>{proposal.candidate_email}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(proposal.status)}
                            <span className="text-xs text-gray-400">
                              Soumis le {new Date(proposal.submitted_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Montant proposé</p>
                            <p className="font-semibold text-green-600">{parseInt(proposal.proposed_amount).toLocaleString()} MRU</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Délai proposé</p>
                            <p className="font-semibold text-blue-600">{proposal.proposed_timeline}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Lettre de motivation</p>
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
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <HiDocumentDownload className="w-4 h-4" />
                              Télécharger le document
                            </a>
                          </div>
                        )}

                        {proposal.notes && (
                          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Notes du recruteur</p>
                            <p className="text-sm text-gray-700">{proposal.notes}</p>
                          </div>
                        )}

                        {proposal.status === 'pending' && (
                          <div className="flex gap-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => updateProposalStatus(proposal.id, 'accepted')}
                              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <HiCheck className="w-4 h-4 inline mr-1" />
                              Accepter
                            </button>
                            <button
                              onClick={() => updateProposalStatus(proposal.id, 'rejected')}
                              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <HiX className="w-4 h-4 inline mr-1" />
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RFPDetail;