// src/components/PrivacyPolicyContent.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyContent = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <p className="text-green-800 text-sm">
          🔒 {t('privacy.hero_text')}
        </p>
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('privacy.data_collected.title')}</h3>
        <ul className={`${isRTL ? 'pr-6 list-disc' : 'pl-6'} text-gray-700 text-sm space-y-1`}>
          <li><strong>{t('privacy.data_collected.identification')}</strong> {t('privacy.data_collected.identification_desc')}</li>
          <li><strong>{t('privacy.data_collected.profile')}</strong> {t('privacy.data_collected.profile_desc')}</li>
          <li><strong>{t('privacy.data_collected.usage')}</strong> {t('privacy.data_collected.usage_desc')}</li>
          <li><strong>{t('privacy.data_collected.payment')}</strong> {t('privacy.data_collected.payment_desc')}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('privacy.data_usage.title')}</h3>
        <ul className={`${isRTL ? 'pr-6 list-disc' : 'pl-6'} text-gray-700 text-sm space-y-1`}>
          <li>{t('privacy.data_usage.item1')}</li>
          <li>{t('privacy.data_usage.item2')}</li>
          <li>{t('privacy.data_usage.item3')}</li>
          <li>{t('privacy.data_usage.item4')}</li>
          <li>{t('privacy.data_usage.item5')}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('privacy.cookies.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {t('privacy.cookies.description')}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('privacy.info_sharing.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed mb-2">
          {t('privacy.info_sharing.description')}
        </p>
        <ul className={`${isRTL ? 'pr-6 list-disc' : 'pl-6'} text-gray-700 text-sm space-y-1`}>
          <li>{t('privacy.info_sharing.item1')}</li>
          <li>{t('privacy.info_sharing.item2')}</li>
          <li>{t('privacy.info_sharing.item3')}</li>
          <li>{t('privacy.info_sharing.item4')}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('privacy.data_security.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {t('privacy.data_security.description')}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('privacy.your_rights.title')}</h3>
        <ul className={`${isRTL ? 'pr-6 list-disc' : 'pl-6'} text-gray-700 text-sm space-y-1`}>
          <li>{t('privacy.your_rights.item1')}</li>
          <li>{t('privacy.your_rights.item2')}</li>
          <li>{t('privacy.your_rights.item3')}</li>
          <li>{t('privacy.your_rights.item4')}</li>
          <li>{t('privacy.your_rights.item5')}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('privacy.data_retention.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {t('privacy.data_retention.description')}
        </p>
      </section>

      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.contact.title')}</h4>
        <p className="text-gray-700 text-sm">
          {t('privacy.contact.email')} : <strong className="text-blue-600">maurilinkk@gmail.com</strong><br />
          {t('privacy.contact.phone')} : <strong>+222 41 47 98 73</strong><br />
          {t('privacy.contact.address')} : <strong>{t('privacy.contact.address_value')}</strong>
        </p>
      </div>

      <div className="text-xs text-gray-500 italic">
        {t('privacy.last_update')} : 1 {t('privacy.january')} 2024
      </div>
    </div>
  );
};

export default PrivacyPolicyContent;