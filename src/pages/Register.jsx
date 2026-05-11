import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff, HiUsers, HiOfficeBuilding, HiPhone, HiUserCircle } from 'react-icons/hi';
import Modal from '../components/Modal';
import TermsOfServiceContent from '../components/TermsOfServiceContent';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';

const Register = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    user_type: 'candidate',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error(t('register.errors.accept_terms'), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    if (formData.password !== formData.password_confirm) {
      toast.error(t('register.errors.password_mismatch'), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(register(formData)).unwrap();
      toast.success(t('register.errors.registration_success'), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
      navigate('/');
    } catch (error) {
      toast.error(t('register.errors.registration_failed'), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper pour la direction des icônes
  const getInputIconPosition = () => {
    return isRTL ? 'right-0 pr-3' : 'left-0 pl-3';
  };

  const getButtonIconPosition = () => {
    return isRTL ? 'left-0 pl-3' : 'right-0 pr-3';
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo et titre */}
          <div className={`text-center ${isRTL ? 'text-right' : ''}`}>
            <h2 className="text-4xl font-extrabold text-gray-900">
              {t('register.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('register.subtitle')}
            </p>
          </div>

          {/* Formulaire */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Type de compte */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, user_type: 'candidate' })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  formData.user_type === 'candidate'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <HiUsers className={`h-6 w-6 mx-auto mb-1 ${formData.user_type === 'candidate' ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-semibold ${formData.user_type === 'candidate' ? 'text-blue-600' : 'text-gray-600'}`}>
                  {t('register.account_type.candidate')}
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, user_type: 'company' })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  formData.user_type === 'company'
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                }`}
              >
                <HiOfficeBuilding className={`h-6 w-6 mx-auto mb-1 ${formData.user_type === 'company' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-semibold ${formData.user_type === 'company' ? 'text-indigo-600' : 'text-gray-600'}`}>
                  {t('register.account_type.company')}
                </p>
              </button>
            </div>

            <div className="space-y-4">
              {/* Nom et prénom sur la même ligne */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                    {t('register.first_name')}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${getInputIconPosition()} flex items-center pointer-events-none`}>
                      <HiUserCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="first_name"
                      type="text"
                      className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50`}
                      placeholder={t('register.first_name')}
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                    {t('register.last_name')}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${getInputIconPosition()} flex items-center pointer-events-none`}>
                      <HiUserCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="last_name"
                      type="text"
                      className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50`}
                      placeholder={t('register.last_name')}
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Nom d'utilisateur */}
              <div className="relative">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t('register.username')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${getInputIconPosition()} flex items-center pointer-events-none`}>
                    <HiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50`}
                    placeholder={t('register.username_placeholder')}
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t('register.email')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${getInputIconPosition()} flex items-center pointer-events-none`}>
                    <HiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50`}
                    placeholder={t('register.email_placeholder')}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="relative">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t('register.phone')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${getInputIconPosition()} flex items-center pointer-events-none`}>
                    <HiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50`}
                    placeholder={t('register.phone_placeholder')}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="relative">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t('register.password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${getInputIconPosition()} flex items-center pointer-events-none`}>
                    <HiLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`block w-full ${isRTL ? 'pr-10 pl-12' : 'pl-10 pr-12'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 ${isRTL ? 'text-right' : ''}`}
                    placeholder={t('register.password_placeholder')}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 ${getButtonIconPosition()} flex items-center`}
                  >
                    {showPassword ? (
                      <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <HiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmation mot de passe */}
              <div className="relative">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t('register.password_confirm')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${getInputIconPosition()} flex items-center pointer-events-none`}>
                    <HiLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password_confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className={`block w-full ${isRTL ? 'pr-10 pl-12' : 'pl-10 pr-12'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 ${isRTL ? 'text-right' : ''}`}
                    placeholder={t('register.password_confirm_placeholder')}
                    value={formData.password_confirm}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute inset-y-0 ${getButtonIconPosition()} flex items-center`}
                  >
                    {showConfirmPassword ? (
                      <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <HiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-600`}>
                {t('register.terms_accept')}{' '}
                <button 
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                >
                  {t('register.terms_of_service')}
                </button>{' '}
                {t('register.terms_and')}{' '}
                <button 
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                >
                  {t('register.privacy_policy')}
                </button>
              </label>
            </div>

            {/* Bouton d'inscription */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'}`}>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('register.registering')}</span>
                  </div>
                ) : (
                  t('register.register_button')
                )}
              </button>
            </div>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('register.separator')}
                </span>
              </div>
            </div>

            {/* Lien de connexion */}
            <div className={`text-center ${isRTL ? 'text-right' : ''}`}>
              <p className="text-sm text-gray-600">
                {t('register.have_account')}{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  {t('register.login_link')}
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className={`text-center pt-4 ${isRTL ? 'text-right' : ''}`}>
            <p className="text-xs text-gray-500">
              {t('register.footer_text')}{' '}
              <button 
                onClick={() => setShowTermsModal(true)}
                className="text-blue-600 hover:text-blue-500 hover:underline transition-colors"
              >
                {t('register.terms_of_service')}
              </button>{' '}
              {t('register.terms_and')}{' '}
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="text-blue-600 hover:text-blue-500 hover:underline transition-colors"
              >
                {t('register.privacy_policy')}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      <Modal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
        title={t('register.modal.terms_title')}
      >
        <TermsOfServiceContent />
      </Modal>

      <Modal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)}
        title={t('register.modal.privacy_title')}
      >
        <PrivacyPolicyContent />
      </Modal>
    </>
  );
};

export default Register;