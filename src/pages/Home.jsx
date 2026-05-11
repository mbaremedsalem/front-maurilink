import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { advertisingService, jobService } from '../api/services';
import JobCard from '../components/JobCard';
import { 
  HiUsers, 
  HiOfficeBuilding, 
  HiBriefcase, 
  HiChartBar,
  HiArrowRight,
  HiStar,
  HiShieldCheck,
  HiTrendingUp,
  HiPause,
  HiPlay,
  HiChevronLeft,
  HiChevronRight,
  HiSparkles,
  HiCalendar,
  HiLocationMarker,
  HiCash,
  HiFilter,
  HiSearch
} from 'react-icons/hi';
import { HiBuildingOffice2 } from 'react-icons/hi2';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [ads, setAds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // La direction RTL est déjà gérée par le hook useDirection dans App.jsx
  
  // Refs séparées pour chaque section
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [jobsRef, jobsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  const controls = useAnimation();

  // Fonction pour obtenir l'URL complète du logo
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'https://142.93.61.53';
    return `${baseUrl}${logoPath}`;
  };

  useEffect(() => {
    fetchAds();
    fetchLatestJobs();
  }, []);

  // Animation pour les stats
  useEffect(() => {
    if (statsInView) {
      controls.start('visible');
    }
  }, [statsInView, controls]);

  useEffect(() => {
    if (!isAutoPlaying || ads.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, ads.length]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await advertisingService.getAll();
      let adsData = [];
      if (response.data) {
        adsData = response.data.results || response.data;
      } else if (response.results) {
        adsData = response.results;
      } else if (Array.isArray(response)) {
        adsData = response;
      }
      setAds(adsData);
      if (adsData.length > 0) trackAdView(adsData[0].id);
    } catch (error) {
      console.error('Error fetching ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestJobs = async () => {
    try {
      setLoadingJobs(true);
      const params = new URLSearchParams();
      params.append('limit', 6);
      params.append('ordering', '-published_date');
      
      const response = await jobService.getAll(params);
      let jobsData = response.data.results || response.data;
      
      if (Array.isArray(jobsData)) {
        jobsData = jobsData.slice(0, 6);
      }
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const trackAdView = async (adId) => {
    try {
      await advertisingService.trackView(adId);
    } catch (error) {
      console.error('Error tracking ad view:', error);
    }
  };

  const handleAdClick = async (adId, link) => {
    try {
      await advertisingService.trackClick(adId);
      window.open(link, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking ad click:', error);
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const nextAd = () => {
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    setIsAutoPlaying(false);
    if (ads.length > 0) trackAdView(ads[(currentAdIndex + 1) % ads.length].id);
  };

  const prevAd = () => {
    setCurrentAdIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
    setIsAutoPlaying(false);
    if (ads.length > 0) trackAdView(ads[(currentAdIndex - 1 + ads.length) % ads.length].id);
  };

  const toggleAutoPlay = () => setIsAutoPlaying(!isAutoPlaying);
  const goToSlide = (index) => {
    setCurrentAdIndex(index);
    setIsAutoPlaying(false);
    if (ads.length > 0) trackAdView(ads[index].id);
  };

  const features = [
    {
      title: t('home.features.candidates.title'),
      description: t('home.features.candidates.description'),
      icon: HiUsers,
      link: '/register',
      linkText: t('home.features.candidates.cta'),
      color: 'from-blue-500 to-blue-600',
      benefits: t('home.features.candidates.benefits', { returnObjects: true })
    },
    {
      title: t('home.features.companies.title'),
      description: t('home.features.companies.description'),
      icon: HiBuildingOffice2,
      link: '/register',
      linkText: t('home.features.companies.cta'),
      color: 'from-indigo-500 to-indigo-600',
      benefits: t('home.features.companies.benefits', { returnObjects: true })
    },
    {
      title: t('home.features.jobs.title'),
      description: t('home.features.jobs.description'),
      icon: HiBriefcase,
      link: '/jobs',
      linkText: t('home.features.jobs.cta'),
      color: 'from-purple-500 to-purple-600',
      benefits: t('home.features.jobs.benefits', { returnObjects: true })
    },
  ];

  const stats = [
    { number: '10K+', label: t('home.stats.jobs'), icon: HiBriefcase },
    { number: '5K+', label: t('home.stats.candidates'), icon: HiUsers },
    { number: '1K+', label: t('home.stats.companies'), icon: HiBuildingOffice2 },
    { number: '95%', label: t('home.stats.satisfaction'), icon: HiChartBar },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };

  const currentAd = ads[currentAdIndex];

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section avec publicités */}
      <div className="relative h-[400px] md:h-[450px] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!loading && currentAd && (
            <motion.div
              key={currentAdIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              {currentAd.image ? (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ 
                      backgroundImage: `url(${currentAd.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse delay-1000" />
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {(!loading && ads.length === 0) && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse delay-1000" />
            </div>
          </div>
        )}

        {!loading && ads.length > 1 && (
          <>
            <button
              onClick={prevAd}
              className="absolute left-4 z-30 bg-black/30 backdrop-blur-md hover:bg-black/50 rounded-full p-2 transition-all duration-300 hover:scale-110"
            >
              <HiChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextAd}
              className="absolute right-4 z-30 bg-black/30 backdrop-blur-md hover:bg-black/50 rounded-full p-2 transition-all duration-300 hover:scale-110"
            >
              <HiChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {!loading && ads.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30 flex gap-1.5">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentAdIndex === index
                    ? 'w-6 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {!loading && ads.length > 1 && (
          <button
            onClick={toggleAutoPlay}
            className="absolute bottom-3 right-4 z-30 bg-black/30 backdrop-blur-md hover:bg-black/50 rounded-full p-1.5 transition-all duration-300"
          >
            {isAutoPlaying ? <HiPause className="w-3.5 h-3.5 text-white" /> : <HiPlay className="w-3.5 h-3.5 text-white" />}
          </button>
        )}
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-full mb-3 border border-white/20"
            >
              <HiSparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-semibold text-white">{t('home.hero.badge')}</span>
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
              {t('home.hero.title')}
              <br />
              {t('home.hero.title_line2')}
            </h1>
            
            <p className="text-sm md:text-base mb-4 text-white/90 max-w-2xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/jobs"
                  className="group bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 text-sm"
                >
                  <span>{t('home.hero.cta_jobs')}</span>
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="group border-2 border-white text-white px-5 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center gap-2 backdrop-blur-sm text-sm"
                >
                  <span>{t('home.hero.cta_register')}</span>
                  <HiStar className="group-hover:rotate-12 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {!loading && currentAd && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <div 
                  onClick={() => handleAdClick(currentAd.id, currentAd.link)}
                  className="inline-block max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-lg p-2.5 cursor-pointer hover:bg-white/20 transition-all duration-300 group border border-white/20"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <HiStar className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/20 px-1.5 py-0.5 rounded">
                          {t('home.hero.sponsored')}
                        </span>
                        {currentAd.company_name && (
                          <span className="text-[10px] text-white/70 flex items-center gap-1">
                            <HiOfficeBuilding className="w-2.5 h-2.5" />
                            {currentAd.company_name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                        {currentAd.title}
                      </h3>
                      <p className="text-[10px] text-white/70 mt-0.5 line-clamp-1">
                        {currentAd.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentAd.location && (
                          <span className="text-[9px] text-white/50 flex items-center gap-0.5">
                            <HiLocationMarker className="w-2.5 h-2.5" />
                            {currentAd.location}
                          </span>
                        )}
                        {currentAd.salary && (
                          <span className="text-[9px] text-white/50 flex items-center gap-0.5">
                            <HiCash className="w-2.5 h-2.5" />
                            {currentAd.salary}
                          </span>
                        )}
                        {currentAd.created_at && (
                          <span className="text-[9px] text-white/50 flex items-center gap-0.5">
                            <HiCalendar className="w-2.5 h-2.5" />
                            {formatDate(currentAd.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <HiArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            )}

            {!loading && ads.length > 1 && isAutoPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                <motion.div
                  key={currentAdIndex}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Section des dernières offres d'emploi */}
      <div ref={jobsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={jobsInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
                <HiSparkles className="w-3.5 h-3.5" />
                <span>{t('home.jobs_section.badge')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t('home.jobs_section.title')}
              </h2>
              <p className="text-gray-600 mt-1">
                {t('home.jobs_section.subtitle')}
              </p>
            </div>
            
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-all group"
            >
              <span>{t('home.jobs_section.view_all')}</span>
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {loadingJobs ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block rounded-full h-12 w-12 border-b-3 border-blue-600"
            />
            <p className="mt-3 text-gray-500">{t('home.jobs_section.loading')}</p>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow-sm"
          >
            <div className="text-5xl mb-3">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{t('home.jobs_section.no_jobs_title')}</h3>
            <p className="text-gray-500">{t('home.jobs_section.no_jobs_subtitle')}</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full"
              >
                <JobCard 
                  job={job} 
                  viewMode="grid" 
                  logoUrl={getLogoUrl(job.company_details?.logo)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={statsRef}
            variants={containerVariants}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-md">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-xs font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
            <HiSparkles className="w-3.5 h-3.5" />
            <span>{t('home.features.badge')}</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t('home.features.title')}
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            {t('home.features.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-5"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-5">
                <div className={`bg-gradient-to-r ${feature.color} rounded-xl w-10 h-10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                
                <h3 className="text-lg font-bold mb-1.5 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mb-3 text-xs leading-relaxed">{feature.description}</p>
                
                <div className="space-y-1 mb-3">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <HiShieldCheck className="h-3 w-3 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <Link 
                  to={feature.link} 
                  className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-xs hover:text-blue-700 group-hover:gap-2 transition-all"
                >
                  {feature.linkText}
                  <HiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {t('home.cta.title')}
            </h2>
            <p className="text-base text-blue-100 mb-5">
              {t('home.cta.subtitle')}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:shadow-xl transition-all text-sm"
              >
                {t('home.cta.button')}
                <HiTrendingUp className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;