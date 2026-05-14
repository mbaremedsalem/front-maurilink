import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  HiMail,
  HiArrowLeft,
  HiPaperAirplane,
  HiCheckCircle
} from 'react-icons/hi';
import { passwordService } from '../api/services';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const isRTL = i18n.language === 'ar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t('forgotPassword.errors.email_required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('forgotPassword.errors.email_invalid'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await passwordService.forgotPassword(email);
      
      if (response.data.success) {
        setEmailSent(true);
        toast.success(response.data.message || t('forgotPassword.success.email_sent'));
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || t('forgotPassword.errors.request_failed');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const iconPosition = isRTL ? 'right-0 pr-4' : 'left-0 pl-4';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6 sm:space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <HiMail className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 px-2">
            {t('forgotPassword.title')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 px-4">
            {t('forgotPassword.subtitle')}
          </p>
        </div>

        {!emailSent ? (
          <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {t('forgotPassword.email_label')}
              </label>
              <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.01] sm:scale-[1.02]' : ''}`}>
                <div className={`absolute inset-y-0 ${iconPosition} flex items-center pointer-events-none`}>
                  <HiMail className={`h-5 w-5 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                  placeholder={t('forgotPassword.email_placeholder')}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 sm:py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('forgotPassword.sending')}</span>
                </>
              ) : (
                <>
                  <span>{t('forgotPassword.send_button')}</span>
                  <HiPaperAirplane className={`ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${isRTL ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
                <HiArrowLeft className={`mr-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                {t('forgotPassword.back_to_login')}
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-6 sm:mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 sm:p-6">
              <HiCheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {t('forgotPassword.success.title')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                {t('forgotPassword.success.message')}
              </p>
              <p className="text-xs text-gray-500">
                {t('forgotPassword.success.redirect')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;