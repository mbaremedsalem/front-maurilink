import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { rfpService } from '../api/services';
import { 
  HiClock, 
  HiLocationMarker, 
  HiCurrencyDollar, 
  HiClipboardList,
  HiSearch,
  HiCalendar,
  HiBriefcase,
  HiDocumentDownload,
  HiOfficeBuilding
} from 'react-icons/hi';
import { toast } from 'react-toastify';

const RFPs = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRfps();
  }, []);

  const fetchRfps = async () => {
    try {
      setLoading(true);
      const response = await rfpService.getAll();
      const rfpsData = response.data.results || response.data;
      setRfps(rfpsData);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      toast.error('Impossible de charger les appels d\'offres');
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://142.93.61.53';
    return `${baseUrl}${logoPath}`;
  };

  const getStatusBadge = (rfp) => {
    if (rfp.status === 'closed') {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Fermé</span>;
    }
    if (rfp.remaining_days <= 0) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Expiré</span>;
    }
    if (rfp.remaining_days <= 3) {
      return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">🔥 Urgent - {rfp.remaining_days}j</span>;
    }
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Ouvert - {rfp.remaining_days}j</span>;
  };

  const filteredRfps = rfps.filter(rfp => {
    const matchesSearch = rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rfp.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rfp.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'open' && rfp.status === 'open' && rfp.remaining_days > 0) ||
                         (filter === 'urgent' && rfp.remaining_days <= 3 && rfp.remaining_days > 0) ||
                         (filter === 'closed' && (rfp.status === 'closed' || rfp.remaining_days <= 0));
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <HiClipboardList className="w-4 h-4" />
            Appels d'offres
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Opportunités de projets
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les appels d'offres des entreprises et proposez vos services
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative mb-4">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par titre, entreprise ou localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { value: 'all', label: 'Tous' },
              { value: 'open', label: 'Ouverts' },
              { value: 'urgent', label: 'Urgents' },
              { value: 'closed', label: 'Fermés' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-500 text-sm mb-4">{filteredRfps.length} appel(s) d'offres trouvé(s)</p>

        {/* RFPs Grid */}
        {filteredRfps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiClipboardList className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Aucun appel d'offres trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRfps.map((rfp, index) => (
              <motion.div
                key={rfp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <Link to={`/rfps/${rfp.id}`} className="block h-full">
                  {/* Section Logo - Première section du cadre */}
                  <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden">
                    {rfp.company_logo ? (
                      <div className="w-full h-full relative">
                        <img
                          src={getLogoUrl(rfp.company_logo)}
                          alt={rfp.company_name}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rfp.company_name || 'Company')}&background=3b82f6&color=ffffff&size=200&rounded=false&bold=true`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white">
                        <HiOfficeBuilding className="w-12 h-12 mb-2 opacity-80" />
                        <p className="text-sm font-medium text-center px-4 opacity-90 line-clamp-2">
                          {rfp.company_name}
                        </p>
                      </div>
                    )}
                    
                    {/* Badge status sur l'image */}
                    <div className="absolute top-3 left-3 z-10">
                      {getStatusBadge(rfp)}
                    </div>
                    
                    {/* Nom de l'entreprise sur l'image */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 inline-block">
                        <div className="flex items-center gap-2">
                          <HiOfficeBuilding className="h-3.5 w-3.5 text-white" />
                          <span className="text-white text-xs font-medium truncate">
                            {rfp.company_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {rfp.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {rfp.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <HiLocationMarker className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{rfp.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <HiCurrencyDollar className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-green-600 truncate">
                          {parseInt(rfp.budget_min).toLocaleString()} - {parseInt(rfp.budget_max).toLocaleString()} MRU
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <HiCalendar className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Date limite: {new Date(rfp.submission_deadline).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <HiBriefcase className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{rfp.duration}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Publié le {new Date(rfp.published_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 flex items-center gap-1">
                        Voir détails
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>

                    {/* Attachment Badge */}
                    {rfp.attachment && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          <HiDocumentDownload className="w-3 h-3" />
                          Fichier joint
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPs;