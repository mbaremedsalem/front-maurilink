import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import {
  HiUser,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiArrowRight,
  HiSparkles
} from 'react-icons/hi';
import Modal from '../components/Modal';
import TermsOfServiceContent from '../components/TermsOfServiceContent';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast.error('Veuillez entrer votre nom d\'utilisateur');
      return;
    }
    if (!formData.password) {
      toast.error('Veuillez entrer votre mot de passe');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(login(formData)).unwrap();
      
      if (rememberMe) {
        localStorage.setItem('rememberedUser', formData.username);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      
      toast.success('Connexion réussie !', {
        position: "top-right",
        autoClose: 3000,
        icon: '🎉'
      });
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Identifiants incorrects', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setFormData(prev => ({ ...prev, username: rememberedUser }));
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Logo et titre */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Connexion
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Formulaire */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Champ Nom d'utilisateur */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Nom d'utilisateur
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'username' ? 'transform scale-[1.02]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <HiUser className={`h-5 w-5 transition-colors duration-300 ${
                      focusedField === 'username' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white hover:bg-gray-50"
                    placeholder="john.doe@exemple.com"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Mot de passe
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <HiLockClosed className={`h-5 w-5 transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white hover:bg-gray-50"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-all duration-200 z-10"
                  >
                    {showPassword ? (
                      <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
                    ) : (
                      <HiEye className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Se souvenir de moi
                </span>
              </label>

              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-all duration-200 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connexion en cours...</span>
                </div>
              ) : (
                <>
                  <span>Se connecter</span>
                  <HiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Nouveau sur MauriLink ?
                </span>
              </div>
            </div>

            {/* Lien d'inscription */}
            <Link
              to="/register"
              className="w-full flex items-center justify-center py-3 px-4 text-sm font-bold rounded-xl text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02] group"
            >
              <HiSparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              Créer un compte gratuitement
            </Link>
          </form>

          {/* Footer avec liens modaux */}
          <div className="text-center pt-6">
            <p className="text-xs text-gray-500">
              En vous connectant, vous acceptez nos{' '}
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Conditions d'utilisation
              </button>{' '}
              et notre{' '}
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Politique de confidentialité
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      <Modal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
        title="Conditions d'utilisation"
      >
        <TermsOfServiceContent />
      </Modal>

      <Modal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)}
        title="Politique de confidentialité"
      >
        <PrivacyPolicyContent />
      </Modal>
    </>
  );
};

export default Login;