import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jobService } from '../api/services';
import JobCard from '../components/JobCard';
import JobForm from '../components/JobForm';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { 
  HiSearch, 
  HiFilter, 
  HiX, 
  HiChevronDown,
  HiSortAscending,
  HiViewGrid,
  HiViewList,
  HiPlus,
  HiBriefcase,
  HiLocationMarker,
  HiCurrencyDollar,
  HiOfficeBuilding,
  HiCalendar,
  HiTrendingUp
} from 'react-icons/hi';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    contract_type: '',
    location: '',
    salary_min: '',
    salary_max: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('list');
  const [stats, setStats] = useState({
    total: 0,
    byContract: {},
    avgSalary: 0
  });

  const { user } = useSelector((state) => state.auth);
  const isRecruiter = user?.user_type === 'company';

  const contractTypes = ['CDI', 'CDD', 'FREELANCE', 'STAGE', 'ALTERNANCE'];
  const locations = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse', 'Nantes', 'Strasbourg', 'Remote', 'France'];
  const sortOptions = [
    { value: 'newest', label: 'Plus récentes' },
    { value: 'oldest', label: 'Plus anciennes' },
    { value: 'salary_high', label: 'Salaire plus élevé' },
    { value: 'salary_low', label: 'Salaire plus bas' },
  ];

  useEffect(() => {
    fetchJobs();
  }, [filters, sortBy]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.contract_type) params.append('contract_type', filters.contract_type);
      if (filters.location) params.append('location', filters.location);
      if (sortBy) params.append('ordering', sortBy === 'newest' ? '-published_date' : sortBy === 'oldest' ? 'published_date' : sortBy === 'salary_high' ? '-salary_max' : 'salary_max');
      
      const response = await jobService.getAll(params);
      let jobsData = response.data.results || response.data;
      
      if (filters.salary_min) {
        jobsData = jobsData.filter(job => job.salary_min >= parseInt(filters.salary_min));
      }
      if (filters.salary_max) {
        jobsData = jobsData.filter(job => job.salary_max <= parseInt(filters.salary_max));
      }
      
      setJobs(jobsData);
      
      // Calculate statistics
      const byContract = {};
      let totalSalary = 0;
      jobsData.forEach(job => {
        byContract[job.contract_type] = (byContract[job.contract_type] || 0) + 1;
        if (job.salary_min && job.salary_max) {
          totalSalary += (parseFloat(job.salary_min) + parseFloat(job.salary_max)) / 2;
        }
      });
      
      setStats({
        total: jobsData.length,
        byContract,
        avgSalary: jobsData.length > 0 ? totalSalary / jobsData.length : 0
      });
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      await jobService.create(jobData);
      toast.success('Offre créée avec succès !');
      fetchJobs();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      contract_type: '',
      location: '',
      salary_min: '',
      salary_max: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Fonction pour obtenir l'URL complète du logo
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://142.93.61.53';
    return `${baseUrl}${logoPath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section avec statistiques */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center flex-wrap gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Trouvez votre prochain défi professionnel
              </h1>
              <p className="text-xl text-blue-100">
                {stats.total} offres disponibles actuellement
              </p>
            </div>
            
            {isRecruiter && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <HiPlus className="w-5 h-5" />
                Publier une offre
              </motion.button>
            )}
          </motion.div>

          {/* Statistiques rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiOfficeBuilding className="h-5 w-5" />
                <span className="text-sm font-medium">Entreprises</span>
              </div>
              <p className="text-2xl font-bold">{new Set(jobs.map(j => j.company_details?.id)).size}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiBriefcase className="h-5 w-5" />
                <span className="text-sm font-medium">Types de contrat</span>
              </div>
              <p className="text-2xl font-bold">{Object.keys(stats.byContract).length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiTrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Salaire moyen</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(stats.avgSalary).toLocaleString()} MRU</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiCalendar className="h-5 w-5" />
                <span className="text-sm font-medium">Dernière offre</span>
              </div>
              <p className="text-2xl font-bold">
                {jobs.length > 0 ? new Date(jobs[0].published_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 -mt-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Titre du poste, mots-clés, compétences..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-all"
              >
                <HiFilter className="h-5 w-5" />
                Filtres
                {hasActiveFilters && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-1">
                    {Object.values(filters).filter(v => v !== '').length}
                  </span>
                )}
                <HiChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </motion.button>

              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <HiViewList className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <HiViewGrid className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <HiSortAscending className="h-4 w-4" />
              <span>Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-transparent font-medium text-gray-900 focus:outline-none cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <HiX className="h-4 w-4" />
                Effacer les filtres
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiBriefcase className="inline h-4 w-4 mr-1" />
                      Type de contrat
                    </label>
                    <select
                      name="contract_type"
                      value={filters.contract_type}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tous les types</option>
                      {contractTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiLocationMarker className="inline h-4 w-4 mr-1" />
                      Localisation
                    </label>
                    <select
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Toutes les villes</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiCurrencyDollar className="inline h-4 w-4 mr-1" />
                      Salaire minimum (MRU)
                    </label>
                    <input
                      type="number"
                      name="salary_min"
                      placeholder="Minimum"
                      value={filters.salary_min}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiCurrencyDollar className="inline h-4 w-4 mr-1" />
                      Salaire maximum (MRU)
                    </label>
                    <input
                      type="number"
                      name="salary_max"
                      placeholder="Maximum"
                      value={filters.salary_max}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block rounded-full h-16 w-16 border-b-4 border-blue-600"
            ></motion.div>
            <p className="mt-4 text-gray-600">Chargement des offres...</p>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-sm"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-600 mb-6">
              Aucune offre ne correspond à vos critères de recherche
            </p>
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Effacer tous les filtres
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            <AnimatePresence>
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard 
                    job={job} 
                    viewMode={viewMode}
                    logoUrl={getLogoUrl(job.company_details?.logo)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {isRecruiter && (
        <JobForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateJob}
        />
      )}
    </div>
  );
};

export default Jobs;