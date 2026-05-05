// src/components/TermsOfServiceContent.jsx
import React from 'react';

const TermsOfServiceContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-blue-800 text-sm">
          📖 En utilisant MauriLink, vous acceptez ces conditions. Veuillez les lire attentivement.
        </p>
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">1. Acceptation des conditions</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          En accédant et en utilisant MauriLink, vous acceptez d'être lié par ces conditions d'utilisation, 
          toutes les lois et réglementations applicables. Si vous n'êtes pas d'accord, vous êtes interdit 
          d'utiliser ou d'accéder à ce site.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">2. Comptes utilisateur</h3>
        <p className="text-gray-700 text-sm leading-relaxed mb-2">
          Vous êtes responsable de :
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
          <li>Maintenir la confidentialité de votre mot de passe</li>
          <li>Toutes les activités sous votre compte</li>
          <li>Nous informer de toute utilisation non autorisée</li>
          <li>Fournir des informations exactes et à jour</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">3. Abonnements et paiements</h3>
        <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
          <li>Les frais sont facturés à l'avance (mensuel ou annuel)</li>
          <li>Les abonnements sont automatiquement renouvelés</li>
          <li>Annulation possible depuis les paramètres du compte</li>
          <li>Aucun remboursement pour les périodes partielles</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">4. Contenu utilisateur</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Vous conservez tous vos droits sur le contenu que vous publiez sur MauriLink. En publiant du contenu, 
          vous accordez à MauriLink une licence mondiale, non exclusive et libre de droits pour utiliser, 
          reproduire et distribuer votre contenu dans le cadre de la fourniture de nos services.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">5. Comportement interdit</h3>
        <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
          <li>Utilisation à des fins illégales</li>
          <li>Contenu offensant ou haineux</li>
          <li>Harcèlement ou intimidation</li>
          <li>Accès non autorisé aux systèmes</li>
          <li>Utilisation de robots ou méthodes automatisées</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">6. Résiliation</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Nous nous réservons le droit de résilier ou suspendre votre compte immédiatement, sans préavis, 
          si vous violez ces conditions. Après résiliation, votre droit d'utiliser le service cessera immédiatement.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">7. Limitation de responsabilité</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          MauriLink ne sera pas responsable des dommages indirects, accessoires ou consécutifs découlant 
          de l'utilisation ou de l'incapacité à utiliser nos services, même si nous avons été informés 
          de la possibilité de tels dommages.
        </p>
      </section>

      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
        <p className="text-gray-700 text-sm">
          Questions ? Contactez-nous : <strong className="text-blue-600">support@maurilink.com</strong>
        </p>
      </div>
    </div>
  );
};

export default TermsOfServiceContent;