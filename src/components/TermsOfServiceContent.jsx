// src/components/TermsOfServiceContent.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsOfServiceContent = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-blue-800 text-sm">
          📖 {t('terms.hero_text_short')}
        </p>
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('terms.acceptance.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {t('terms.acceptance.description')}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('terms.user_account.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed mb-2">
          {t('terms.user_account.responsible_for')}
        </p>
        <ul className={`${isRTL ? 'pr-6 list-disc' : 'pl-6'} text-gray-700 text-sm space-y-1`}>
          <li>{t('terms.user_account.item1')}</li>
          <li>{t('terms.user_account.item2')}</li>
          <li>{t('terms.user_account.item3')}</li>
          <li>{t('terms.user_account.item4')}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('terms.subscriptions.title')}</h3>
        <ul className={`${isRTL ? 'pr-6 list-disc' : 'pl-6'} text-gray-700 text-sm space-y-1`}>
          <li>{t('terms.subscriptions.item1')}</li>
          <li>{t('terms.subscriptions.item2')}</li>
          <li>{t('terms.subscriptions.item3')}</li>
          <li>{t('terms.subscriptions.item4')}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('terms.user_content.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {t('terms.user_content.description')}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('terms.prohibited_conduct.title')}</h3>
        <ul className={`${isRTL ? 'pr-6 list-disc' : 'pl-6'} text-gray-700 text-sm space-y-1`}>
          <li>{t('terms.prohibited_conduct.item1')}</li>
          <li>{t('terms.prohibited_conduct.item2')}</li>
          <li>{t('terms.prohibited_conduct.item3')}</li>
          <li>{t('terms.prohibited_conduct.item4')}</li>
          <li>{t('terms.prohibited_conduct.item5')}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('terms.termination.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {t('terms.termination.description')}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t('terms.limitation_liability.title')}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {t('terms.limitation_liability.description')}
        </p>
      </section>

      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">{t('terms.contact.title')}</h4>
        <p className="text-gray-700 text-sm">
          {t('terms.contact.questions')} : <strong className="text-blue-600">maurilinkk@gmail.com</strong>
        </p>
      </div>
    </div>
  );
};

export default TermsOfServiceContent;