import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiArrowLeft,
  HiCheckCircle,
  HiKey
} from 'react-icons/hi';
import { passwordService } from '../api/services';

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    otp_code: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  // Refs pour les inputs PIN
  const pinInputs = useRef([]);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(emailParam) }));
    }
  }, [location]);

  // Gestionnaire pour les inputs PIN
  const handlePinChange = (index, value) => {
    // Ne prendre que les chiffres
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = formData.otp_code.split('');
    newOtp[index] = value;
    const otpValue = newOtp.join('');
    
    setFormData(prev => ({ ...prev, otp_code: otpValue }));
    
    // Auto-focus sur le prochain input
    if (value && index < 3) {
      pinInputs.current[index + 1].focus();
    }
  };

  // Gestionnaire pour la touche retour
  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp_code[index] && index > 0) {
      pinInputs.current[index - 1].focus();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error(t('resetPassword.errors.email_required'));
      return;
    }
    if (!formData.otp_code || formData.otp_code.length !== 4) {
      toast.error(t('resetPassword.errors.otp_required'));
      return;
    }
    if (!formData.new_password) {
      toast.error(t('resetPassword.errors.password_required'));
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      toast.error(t('resetPassword.errors.password_mismatch'));
      return;
    }
    if (formData.new_password.length < 8) {
      toast.error(t('resetPassword.errors.password_length'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await passwordService.resetPassword({
        email: formData.email,
        otp_code: formData.otp_code,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      
      if (response.data.success) {
        setResetSuccess(true);
        toast.success(response.data.message || t('resetPassword.success.reset_complete'));
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          t('resetPassword.errors.request_failed');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const iconPosition = isRTL ? 'right-0 pr-4' : 'left-0 pl-4';

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 sm:py-12 px-4">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 sm:p-8 text-center">
            <HiCheckCircle className="h-14 w-14 sm:h-16 sm:w-16 text-green-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {t('resetPassword.success.title')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              {t('resetPassword.success.message')}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {t('resetPassword.success.redirect')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6 sm:space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <HiKey className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 px-2">
            {t('resetPassword.title')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 px-4">
            {t('resetPassword.subtitle')}
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          {/* Email (disabled) */}
          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('resetPassword.email_label')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"
              placeholder={t('resetPassword.email_placeholder')}
              disabled
            />
          </div>

          {/* PIN Input OTP à 4 chiffres */}
          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('resetPassword.otp_label')}
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (pinInputs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={formData.otp_code[index] || ''}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                    focusedField === 'otp' ? 'border-blue-500 ring-2 ring-blue-200' : ''
                  }`}
                  placeholder="•"
                />
              ))}
            </div>
            <p className={`text-xs text-gray-500 mt-2 ${isRTL ? 'text-right' : ''}`}>
              {t('resetPassword.otp_hint')}
            </p>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('resetPassword.new_password_label')}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${iconPosition} flex items-center pointer-events-none`}>
                <HiLockClosed className={`h-5 w-5 transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`block w-full ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12'} py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                placeholder={t('resetPassword.new_password_placeholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3 sm:pl-4' : 'right-0 pr-3 sm:pr-4'} flex items-center`}
              >
                {showPassword ? 
                  <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" /> : 
                  <HiEye className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
                }
              </button>
            </div>
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('resetPassword.confirm_password_label')}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${iconPosition} flex items-center pointer-events-none`}>
                <HiLockClosed className={`h-5 w-5 transition-colors duration-300 ${
                  focusedField === 'confirm' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                className={`block w-full ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12'} py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300`}
                placeholder={t('resetPassword.confirm_password_placeholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3 sm:pl-4' : 'right-0 pr-3 sm:pr-4'} flex items-center`}
              >
                {showConfirmPassword ? 
                  <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" /> : 
                  <HiEye className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
                }
              </button>
            </div>
          </div>

          {/* Bouton de réinitialisation */}
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
                <span>{t('resetPassword.resetting')}</span>
              </>
            ) : (
              t('resetPassword.reset_button')
            )}
          </button>

          {/* Lien retour */}
          <div className="text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
              <HiArrowLeft className={`mr-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {t('resetPassword.back_to_login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;