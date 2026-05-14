import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiBriefcase, HiUserGroup, HiGlobeAlt, HiCheckCircle } from 'react-icons/hi';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: HiBriefcase,
      titleKey: "about.features.connection.title",
      descriptionKey: "about.features.connection.description"
    },
    {
      icon: HiUserGroup,
      titleKey: "about.features.support.title",
      descriptionKey: "about.features.support.description"
    },
    {
      icon: HiGlobeAlt,
      titleKey: "about.features.network.title",
      descriptionKey: "about.features.network.description"
    },
    {
      icon: HiCheckCircle,
      titleKey: "about.features.quality.title",
      descriptionKey: "about.features.quality.description"
    }
  ];

  const values = [
    {
      titleKey: "about.values.transparency.title",
      descriptionKey: "about.values.transparency.description"
    },
    {
      titleKey: "about.values.innovation.title",
      descriptionKey: "about.values.innovation.description"
    },
    {
      titleKey: "about.values.quality.title",
      descriptionKey: "about.values.quality.description"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section - Responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2">
              {t('about.title')}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto px-4">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('about.mission.title')}
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-blue-600 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            {t('about.mission.description')}
          </p>
        </div>

        {/* Features Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-5 sm:p-6 text-center hover:shadow-xl transition-shadow mx-2 sm:mx-0">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
                <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics - Responsive */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm sm:text-base opacity-90 px-2">
                {t('about.stats.jobs')}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm sm:text-base opacity-90 px-2">
                {t('about.stats.companies')}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">3000+</div>
              <div className="text-sm sm:text-base opacity-90 px-2">
                {t('about.stats.candidates')}
              </div>
            </div>
          </div>
        </div>

        {/* Values Section - Responsive */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('about.values.title')}
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-blue-600 mx-auto mb-6 sm:mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-5 sm:p-6 mx-2 sm:mx-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {t(value.titleKey)}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t(value.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;