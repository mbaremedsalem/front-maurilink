import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiBriefcase, HiUserGroup, HiGlobeAlt, HiCheckCircle } from 'react-icons/hi';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: HiBriefcase,
      title: "Mise en relation",
      description: "Nous connectons les candidats qualifiés avec les entreprises à la recherche de talents."
    },
    {
      icon: HiUserGroup,
      title: "Accompagnement RH",
      description: "Nous publions des conseils pour les candidats et les professionnels RH."
    },
    {
      icon: HiGlobeAlt,
      title: "Large réseau",
      description: "Une plateforme qui couvre tous les secteurs d'activité et types d'emplois."
    },
    {
      icon: HiCheckCircle,
      title: "Qualité garantie",
      description: "Nous vérifions toutes les offres et candidatures pour assurer leur authenticité."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              À propos de MauriLink
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Votre partenaire de confiance pour l'emploi et le recrutement en Mauritanie
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Mission</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            MauriLink est une plateforme innovante qui lie les candidats et les entreprises. 
            Nous publions des offres d'emploi, des appels d'offres, et fournissons des conseils 
            personnalisés pour les candidats et les professionnels RH.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">Offres d'emploi publiées</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Entreprises partenaires</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3000+</div>
              <div className="text-lg opacity-90">Candidats inscrits</div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparence</h3>
              <p className="text-gray-600">Communication claire et honnête avec tous nos utilisateurs</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">Solutions modernes pour faciliter le recrutement</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Qualité</h3>
              <p className="text-gray-600">Excellence dans nos services et accompagnements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;