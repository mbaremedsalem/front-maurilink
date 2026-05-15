import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { encodeId } from '../utils/hashIds';
import { 
  HiLocationMarker, 
  HiCurrencyEuro, 
  HiBriefcase,
  HiOfficeBuilding,
  HiCalendar,
  HiClock,
  HiEye
} from 'react-icons/hi';

const JobCard = ({ job, viewMode = 'list', logoUrl }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const formatSalary = (salary) => {
    if (!salary) return t('jobCard.not_specified');
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR').format(salary) + ' MRU';
  };

  const getContractTypeColor = (type) => {
    const colors = {
      'CDI': 'bg-green-100 text-green-800',
      'CDD': 'bg-blue-100 text-blue-800',
      'STAGE': 'bg-purple-100 text-purple-800',
      'ALTERNANCE': 'bg-orange-100 text-orange-800',
      'FREELANCE': 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getContractTypeLabel = (type) => {
    const labels = {
      'CDI': t('jobCard.contract_types.cdi'),
      'CDD': t('jobCard.contract_types.cdd'),
      'STAGE': t('jobCard.contract_types.stage'),
      'ALTERNANCE': t('jobCard.contract_types.alternance'),
      'FREELANCE': t('jobCard.contract_types.freelance')
    };
    return labels[type] || type;
  };

  const getDaysSincePublished = (date) => {
    const today = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(today - publishedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSincePublished = getDaysSincePublished(job.published_date);
  const isNew = daysSincePublished <= 7;

  // Format date selon la langue
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Helper pour la direction RTL
  const getArrowIcon = () => {
    if (isRTL) {
      return <span className="transform group-hover:-translate-x-1 transition-transform">←</span>;
    }
    return <span className="transform group-hover:translate-x-1 transition-transform">→</span>;
  };

  // Mode Grid - Carte avec image pleine largeur
  if (viewMode === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -8 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group h-full w-full flex flex-col"
      >
        <Link to={`/jobs/${encodeId(job.id)}`} className="block h-full w-full flex flex-col">
          {/* Section Image - Prend toute la largeur et hauteur proportionnelle */}
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {logoUrl ? (
              <div className="w-full h-full relative">
                <img
                  src={logoUrl}
                  alt={job.company_details?.company_name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_details?.company_name || 'Company')}&background=3b82f6&color=ffffff&size=400&rounded=false&bold=true`;
                  }}
                />
                {/* Overlay gradient pour meilleure lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white">
                <HiOfficeBuilding className="w-12 h-12 md:w-16 md:h-16 mb-2 opacity-80" />
                <p className="text-xs md:text-sm font-medium text-center px-4 opacity-90 line-clamp-2">
                  {job.company_details?.company_name || t('jobCard.company')}
                </p>
              </div>
            )}
            
            {/* Badges positionnés sur l'image */}
            <div className={`absolute top-3 ${isRTL ? 'right-3 left-3' : 'left-3 right-3'} flex flex-wrap gap-2 z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-md ${getContractTypeColor(job.contract_type)}`}>
                {getContractTypeLabel(job.contract_type)}
              </span>
              {isNew && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-md shadow-md">
                  <HiClock className="h-3 w-3" />
                  {t('jobCard.new_badge')}
                </span>
              )}
            </div>

            {/* Badge entreprise en bas de l'image */}
            <div className={`absolute bottom-3 ${isRTL ? 'right-3 left-3' : 'left-3 right-3'} z-10`}>
              <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 inline-block max-w-full">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <HiOfficeBuilding className="h-3.5 w-3.5 text-white flex-shrink-0" />
                  <span className="text-white text-xs font-medium truncate">
                    {job.company_details?.company_name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`p-4 flex-1 flex flex-col ${isRTL ? 'text-right' : ''}`}>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {job.title}
            </h3>

            <div className={`flex items-center gap-2 text-gray-600 text-xs md:text-sm mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <HiLocationMarker className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">{job.location || t('jobCard.not_specified')}</span>
            </div>

            <div className={`flex flex-wrap items-center justify-between gap-2 text-sm mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-1 text-green-600 font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                <HiCurrencyEuro className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">
                  {job.salary_min && job.salary_max 
                    ? `${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()} MRU`
                    : t('jobCard.not_specified')}
                </span>
              </div>
              <div className={`flex items-center gap-1 text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <HiCalendar className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="text-xs">
                  {formatDate(job.published_date)}
                </span>
              </div>
            </div>

            {/* Description preview */}
            {job.description && (
              <p className="text-gray-600 text-xs md:text-sm line-clamp-2 mb-3">
                {job.description.length > 100 ? `${job.description.substring(0, 100)}...` : job.description}
              </p>
            )}

            {/* Skills preview */}
            {job.criteria?.skills && job.criteria.skills.length > 0 && (
              <div className={`flex flex-wrap gap-1.5 mt-auto pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {job.criteria.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                    {skill}
                  </span>
                ))}
                {job.criteria.skills.length > 3 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    +{job.criteria.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-4 pb-4 pt-3 border-t border-gray-100 mt-auto ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <HiEye className="h-3.5 w-3.5" />
                  {Math.floor(Math.random() * 50) + 10}
                </span>
              </div>
              <span className="text-blue-600 font-medium text-xs md:text-sm group-hover:text-blue-700 flex items-center gap-1">
                {t('jobCard.view_details')}
                {getArrowIcon()}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Mode List - Version horizontale avec image à gauche qui prend toute la hauteur
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group w-full"
    >
      {/* ✅ CORRECTION ICI : job.id → encodeId(job.id) */}
      <Link to={`/jobs/${encodeId(job.id)}`} className="block w-full h-full">
        <div className={`flex flex-col sm:flex-row w-full ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {/* Section Image - Prend toute la hauteur sur mobile, largeur fixe sur desktop */}
          <div className="relative w-full sm:w-48 md:w-56 lg:w-64 h-48 sm:h-auto aspect-[16/9] sm:aspect-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
            {logoUrl ? (
              <div className="w-full h-full relative">
                <img
                  src={logoUrl}
                  alt={job.company_details?.company_name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_details?.company_name || 'Company')}&background=3b82f6&color=ffffff&size=400&rounded=false&bold=true`;
                  }}
                />
                {/* Overlay pour les badges sur mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:bg-none" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white">
                <HiOfficeBuilding className="w-12 h-12 md:w-16 md:h-16 mb-2 opacity-80" />
                <p className="text-xs md:text-sm font-medium text-center px-4 opacity-90 line-clamp-2">
                  {job.company_details?.company_name || t('jobCard.company')}
                </p>
              </div>
            )}
            
            {/* Badges - sur mobile ils sont sur l'image, sur desktop ils sont dans le contenu */}
            <div className={`absolute top-3 ${isRTL ? 'right-3 left-3' : 'left-3 right-3'} flex flex-wrap gap-2 z-10 sm:hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-md ${getContractTypeColor(job.contract_type)}`}>
                {getContractTypeLabel(job.contract_type)}
              </span>
              {isNew && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-md shadow-md">
                  <HiClock className="h-3 w-3" />
                  {t('jobCard.new_badge')}
                </span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className={`flex-1 p-4 md:p-5 ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex flex-wrap justify-between items-start gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 flex-wrap mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-base md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  {/* Badges desktop cachés sur mobile */}
                  <div className={`hidden sm:flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getContractTypeColor(job.contract_type)}`}>
                      {getContractTypeLabel(job.contract_type)}
                    </span>
                    {isNew && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        <HiClock className="h-3 w-3" />
                        {t('jobCard.new_badge')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <HiOfficeBuilding className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="truncate">{job.company_details?.company_name}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <HiLocationMarker className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="truncate">{job.location || t('jobCard.not_specified')}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-xs md:text-sm line-clamp-2 mb-3">
                  {job.description}
                </p>

                <div className={`flex flex-wrap justify-between items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex flex-wrap items-center gap-3 md:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-1 text-green-600 font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiCurrencyEuro className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-xs md:text-sm">
                        {job.salary_min && job.salary_max 
                          ? `${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()} MRU`
                          : t('jobCard.not_specified')}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 text-gray-500 text-xs md:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <HiCalendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span>{t('jobCard.published_on')} {formatFullDate(job.published_date)}</span>
                    </div>
                  </div>
                  
                  <span className="text-blue-600 font-medium text-xs md:text-sm group-hover:text-blue-700 flex items-center gap-1">
                    {t('jobCard.view_job')}
                    {getArrowIcon()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default JobCard;