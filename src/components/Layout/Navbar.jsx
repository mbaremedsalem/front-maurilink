import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Menu } from '@headlessui/react';
import { 
  HiBriefcase, 
  HiDocumentText, 
  HiUserCircle, 
  HiMenu, 
  HiX, 
  HiHome, 
  HiOfficeBuilding,
  HiClipboardList,
  HiDocumentSearch,
  HiPlusCircle
} from 'react-icons/hi';
import { HiEnvelope } from 'react-icons/hi2';
import { companyService } from '../../api/services';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rfpCount, setRfpCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.user_type === 'company') {
      fetchMyRfpsCount();
    }
  }, [isAuthenticated, user]);

  const fetchMyRfpsCount = async () => {
    try {
      const response = await companyService.getMyRfps();
      const rfps = response.data.results || response.data;
      setRfpCount(rfps.length);
    } catch (error) {
      console.error('Error fetching RFPs count:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navigation = [
    { name: 'Accueil', href: '/', icon: HiHome },
    { name: 'Offres d\'emploi', href: '/jobs', icon: HiOfficeBuilding },
    { name: 'Appels d\'offres', href: '/rfps', icon: HiClipboardList },
    { name: 'Espace Recruteur', href: '/employer-space', icon: HiEnvelope },
    // Dans Navbar.jsx, ajoutez ce lien dans la navigation pour les entreprises
    {
      name: 'Propositions reçues',
      href: '/company-proposals',
      icon: HiDocumentText
    },
    ...(isAuthenticated && user?.user_type === 'company'
      ? [
          { 
            name: 'Mes appels d\'offres', 
            href: '/my-rfps', 
            icon: HiDocumentSearch,
            badge: rfpCount > 0 ? rfpCount : null
          },
          { name: 'Mes candidatures', href: '/applications', icon: HiBriefcase },
          // { name: 'Créer un appel d\'offres', href: '/create-rfp', icon: HiPlusCircle }
        ]
      : []),
    ...(isAuthenticated && user?.user_type === 'candidate'
      ? [
          { name: 'Mon CV', href: '/resumes', icon: HiDocumentText },
        ]
      : []),
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et marque */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r to-indigo-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img 
                  src={new URL('/src/assets/images/logo.png', import.meta.url).href} 
                  alt="Logo MauriLink" 
                  className="relative h-30 w-60 object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 group relative"
              >
                <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Actions utilisateur desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Inscription
                </Link>
              </>
            ) : (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
                  <HiUserCircle className="h-8 w-8" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.user_type === 'candidate' ? 'Candidat' : 'Recruteur'}</p>
                  </div>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-1 z-10 border border-gray-100 overflow-hidden">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`${active ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''} block px-4 py-3 text-sm text-gray-700 transition-colors`}
                      >
                        <div className="flex items-center space-x-2">
                          <HiUserCircle className="h-5 w-5" />
                          <span>Mon profil</span>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                  {user?.user_type === 'company' && (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/my-rfps"
                            className={`${active ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''} block px-4 py-3 text-sm text-gray-700 transition-colors`}
                          >
                            <div className="flex items-center space-x-2">
                              <HiDocumentSearch className="h-5 w-5" />
                              <span>Mes appels d'offres</span>
                              {rfpCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                  {rfpCount}
                                </span>
                              )}
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/create-rfp"
                            className={`${active ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''} block px-4 py-3 text-sm text-gray-700 transition-colors`}
                          >
                            <div className="flex items-center space-x-2">
                              <HiPlusCircle className="h-5 w-5" />
                              <span>Créer un appel d'offres</span>
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                    </>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${active ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600' : ''} block w-full text-left px-4 py-3 text-sm transition-colors`}
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Déconnexion</span>
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            )}
          </div>

          {/* Menu mobile button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {isMobileMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            
            <div className="border-t border-gray-100 pt-3 mt-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Connexion</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Inscription</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HiUserCircle className="h-5 w-5" />
                    <span>Mon profil</span>
                  </Link>
                  {user?.user_type === 'company' && (
                    <>
                      <Link
                        to="/my-rfps"
                        className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <HiDocumentSearch className="h-5 w-5" />
                          <span>Mes appels d'offres</span>
                        </div>
                        {rfpCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {rfpCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/create-rfp"
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <HiPlusCircle className="h-5 w-5" />
                        <span>Créer un appel d'offres</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Déconnexion</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;