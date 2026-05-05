// src/components/PrivacyPolicyContent.jsx
import React from 'react';

const PrivacyPolicyContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <p className="text-green-800 text-sm">
          🔒 Chez MauriLink, nous protégeons vos données personnelles avec la plus grande attention.
        </p>
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">1. Données collectées</h3>
        <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
          <li><strong>Identification :</strong> Nom, email, téléphone</li>
          <li><strong>Profil :</strong> Photo, biographie, préférences</li>
          <li><strong>Utilisation :</strong> Historique de connexion, pages visitées</li>
          <li><strong>Paiement :</strong> Informations bancaires (sécurisées)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">2. Utilisation des données</h3>
        <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
          <li>Fournir et améliorer nos services</li>
          <li>Gérer votre compte et abonnement</li>
          <li>Communiquer les mises à jour et offres</li>
          <li>Personnaliser votre expérience</li>
          <li>Prévenir la fraude et activités illégales</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">3. Cookies</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Nous utilisons des cookies pour améliorer votre expérience, mémoriser vos préférences et analyser 
          le trafic. Vous pouvez contrôler les cookies via les paramètres de votre navigateur.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">4. Partage des informations</h3>
        <p className="text-gray-700 text-sm leading-relaxed mb-2">
          Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations dans les cas suivants :
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
          <li>Avec votre consentement explicite</li>
          <li>Pour nous conformer aux obligations légales</li>
          <li>Avec nos partenaires de confiance</li>
          <li>Dans le cadre d'une fusion ou acquisition</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">5. Sécurité des données</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Nous utilisons le chiffrement, l'authentification à deux facteurs et des audits réguliers 
          pour protéger vos données contre tout accès non autorisé.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">6. Vos droits (RGPD)</h3>
        <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement ("droit à l'oubli")</li>
          <li>Droit à la portabilité des données</li>
          <li>Droit d'opposition au traitement</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">7. Conservation des données</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Nous conservons vos données aussi longtemps que votre compte est actif. En cas de suppression 
          de votre compte, nous conservons certaines données pendant une période supplémentaire pour nous 
          conformer aux obligations légales.
        </p>
      </section>

      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Contact DPO</h4>
        <p className="text-gray-700 text-sm">
          Email : <strong className="text-blue-600">dpo@maurilink.com</strong><br />
          Tél : <strong>+33 (0)1 23 45 67 89</strong><br />
          Adresse : <strong>123 Avenue de la République, 75011 Paris</strong>
        </p>
      </div>

      <div className="text-xs text-gray-500 italic">
        Dernière mise à jour : 1er janvier 2024
      </div>
    </div>
  );
};

export default PrivacyPolicyContent;