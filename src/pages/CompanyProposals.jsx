import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
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
      toast.error('Impossible de charger les propositions');
    } finally {
      setLoading(false);
    }
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

  if (user?.user_type !== 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiX className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Cette page est réservée aux entreprises</p>
          <Link to="/" className="inline-block mt-4 text-blue-600 hover:text-blue-700">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group">
          <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Retour
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Propositions reçues</h1>
          <p className="text-gray-600 mt-1">Gérez les propositions des candidats pour vos appels d'offres</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <HiBriefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <HiClock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Acceptées</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <HiCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Refusées</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <HiX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'accepted', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'accepted' ? 'Acceptées' : 'Refusées'}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des propositions...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiDocumentDownload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucune proposition trouvée</p>
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
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <HiUserCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{proposal.candidate_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <HiMail className="w-3.5 h-3.5" />
                          <span>{proposal.candidate_email}</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      to={`/rfps/${proposal.rfp}`}
                      className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1 mt-1"
                    >
                      <HiEye className="w-3.5 h-3.5" />
                      Voir l'appel d'offres
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(proposal.status)}
                    <span className="text-xs text-gray-400">
                      Soumis le {new Date(proposal.submitted_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Appel d'offres</p>
                  <p className="text-gray-900">{proposal.rfp_title}</p>
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProposals;