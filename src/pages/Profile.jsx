import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  User, Mail, Briefcase, Calendar, Edit2, Save, X, Award,
  MapPin, Phone, Globe, TrendingUp, CheckCircle, Clock, XCircle,
  PieChart, BarChart3, Eye, Camera, ChevronRight, Building2,
  DollarSign, MapPin as MapPinIcon, Calendar as CalendarIcon,
  FileText, ExternalLink, Loader2, Sparkles, Rocket, Target,
  Shield, Zap, Heart, Star, Users, BookOpen, Code, Coffee
} from 'lucide-react';
import { applicationService, authService } from '../api/services';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, Title, PointElement, LineElement, Filler
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, Title, PointElement, LineElement, Filler
);

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0, pending: 0, accepted: 0, rejected: 0, interviewed: 0
  });
  const [monthlyData, setMonthlyData] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    bio: '',
    location: ''
  });
  
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchApplications();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await authService.getProfile();
      const profileData = response.data;
      setProfile(profileData);
      setFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        bio: profileData.bio || '',
        location: profileData.location || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(user);
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        bio: user?.bio || '',
        location: user?.location || ''
      });
      toast.error('Impossible de charger le profil complet');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getMyApplications();
      const applicationsData = response.data.results || response.data;
      setApplications(applicationsData);
      calculateStats(applicationsData);
      calculateMonthlyStats(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Impossible de charger vos candidatures');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    setStats({
      total: apps.length,
      pending: apps.filter(app => app.status === 'pending').length,
      accepted: apps.filter(app => app.status === 'accepted').length,
      rejected: apps.filter(app => app.status === 'rejected').length,
      interviewed: apps.filter(app => app.status === 'interviewed').length
    });
  };

  const calculateMonthlyStats = (apps) => {
    const monthly = {};
    apps.forEach(app => {
      const date = new Date(app.applied_date);
      const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      monthly[monthYear] = (monthly[monthYear] || 0) + 1;
    });
    setMonthlyData(monthly);
  };

  const getFilteredApplications = () => {
    if (activeFilter === 'all') return applications;
    return applications.filter(app => app.status === activeFilter);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await authService.updateProfile(formData);
      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
      setProfile(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append(type, file);

    try {
      if (type === 'image') {
        await api.post('/auth/profile/upload-image/', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/auth/profile/upload-cover/', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      toast.success('Image mise à jour avec succès !');
      fetchProfile();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    const firstName = formData.first_name || profile?.first_name || '';
    const lastName = formData.last_name || profile?.last_name || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return (profile?.username || user?.username || 'U').charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (formData.first_name && formData.last_name) {
      return `${formData.first_name} ${formData.last_name}`;
    }
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile?.username || user?.username || 'Utilisateur';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-rose-100 text-rose-800 border-rose-200',
      interviewed: 'bg-sky-100 text-sky-800 border-sky-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      accepted: <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      rejected: <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      interviewed: <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
    };
    return icons[status] || <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      accepted: 'Acceptée',
      rejected: 'Refusée',
      interviewed: 'Entretien'
    };
    return labels[status] || status;
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR').format(salary) + ' MRU';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const pieChartData = {
    labels: ['En attente', 'Acceptées', 'Refusées', 'Entretien'],
    datasets: [{
      data: [stats.pending, stats.accepted, stats.rejected, stats.interviewed],
      backgroundColor: ['#F59E0B', '#10B981', '#EF4444', '#3B82F6'],
      borderColor: ['#fff', '#fff', '#fff', '#fff'],
      borderWidth: 2,
    }],
  };

  const barChartData = {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: 'Candidatures',
      data: Object.values(monthlyData),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderRadius: 12,
      barPercentage: 0.6,
      categoryPercentage: 0.8,
    }],
  };

  const lineChartData = {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: 'Tendance',
      data: Object.values(monthlyData),
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      borderColor: '#3B82F6',
      borderWidth: 3,
      tension: 0.4,
      pointBackgroundColor: '#3B82F6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          font: { size: 10, weight: '500' }, 
          usePointStyle: true, 
          boxWidth: 8,
          generateLabels: (chart) => {
            const labels = chart.data.labels;
            return labels.map((label, i) => ({
              text: label,
              fillStyle: chart.data.datasets[0].backgroundColor[i],
              strokeStyle: chart.data.datasets[0].borderColor[i],
              lineWidth: 2,
              hidden: false,
              index: i,
              font: { size: 10 }
            }));
          }
        } 
      },
      tooltip: { backgroundColor: '#1F2937', padding: 10, titleFont: { size: 12 }, bodyFont: { size: 11 }, cornerRadius: 8 }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#E5E7EB', dash: [5, 5] } },
      x: { ticks: { font: { size: 10, rotation: 45, maxRotation: 45 } }, grid: { display: false } }
    }
  };

  const userTypeConfig = {
    candidate: { label: 'Candidat', icon: Award, color: 'from-blue-500 to-indigo-600', badgeColor: 'bg-blue-100 text-blue-800' },
    company: { label: 'Entreprise', icon: Building2, color: 'from-purple-500 to-pink-600', badgeColor: 'bg-purple-100 text-purple-800' }
  };

  const config = userTypeConfig[profile?.user_type || user?.user_type] || userTypeConfig.candidate;

  const statCards = [
    { label: 'Total', value: stats.total, icon: Briefcase, color: 'blue', gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
    { label: 'En attente', value: stats.pending, icon: Clock, color: 'amber', gradient: 'from-amber-500 to-amber-600', bgGradient: 'from-amber-50 to-amber-100' },
    { label: 'Acceptées', value: stats.accepted, icon: CheckCircle, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600', bgGradient: 'from-emerald-50 to-emerald-100' },
    { label: 'Refusées', value: stats.rejected, icon: XCircle, color: 'rose', gradient: 'from-rose-500 to-rose-600', bgGradient: 'from-rose-50 to-rose-100' },
    { label: 'Succès', value: `${stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%`, icon: Target, color: 'purple', gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' }
  ];

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center px-4">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto">
            <div className="w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pb-8 sm:pb-12">
      {/* Cover Section - Responsive */}
      <div className="relative h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96">
        <div className="absolute inset-0">
          {(profile?.cover_image || user?.cover_image) ? (
            <img
              src={profile?.cover_image || user?.cover_image}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${config.color} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                <Rocket className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
        
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 p-1.5 sm:p-2 md:p-2.5 bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl text-white hover:bg-black/60 transition-all duration-300 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Camera className="w-3 h-3 sm:w-4 sm:h-4" />}
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover_image')} />
      </div>

      {/* Profile Content - Responsive Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-12 xs:-mt-14 sm:-mt-16 md:-mt-20 lg:-mt-24 relative z-20">
        {/* Profile Header Card - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6">
              {/* Avatar - Responsive sizes */}
              <div className="relative flex justify-center sm:justify-start">
                <div className="relative">
                  <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 sm:p-1">
                    <div className="w-full h-full rounded-xl sm:rounded-2xl bg-white overflow-hidden flex items-center justify-center">
                      {(profile?.image || user?.image) ? (
                        <img src={profile?.image || user?.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {getInitials()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-1 sm:p-1.5 md:p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 animate-spin" /> : <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-gray-600" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'image')} />
                </div>
              </div>

              {/* User Info - Responsive */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div>
                    <h1 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                      {getFullName()}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-1 sm:mt-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 ${config.badgeColor} rounded-full text-[10px] xs:text-xs font-medium`}>
                        <config.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {config.label}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-[10px] xs:text-xs sm:text-sm">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Membre depuis {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'récemment'}
                      </div>
                    </div>
                  </div>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="self-center sm:self-auto inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition-all duration-300 text-gray-700 text-xs sm:text-sm font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex gap-2 self-center sm:self-auto">
                      <button onClick={handleSave} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg sm:rounded-xl transition-all text-white text-xs sm:text-sm font-medium">
                        <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Sauvegarder
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition-all text-gray-700 text-xs sm:text-sm font-medium">
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Annuler
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Info - Responsive Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-gray-600">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-[11px] xs:text-xs sm:text-sm truncate">{profile?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                      <span className="text-[11px] xs:text-xs sm:text-sm">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                      <span className="text-[11px] xs:text-xs sm:text-sm truncate">{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Bio - Responsive */}
                {profile?.bio && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl">
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Mode Fields - Responsive */}
            {isEditing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Localisation</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="xs:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-blue-500" placeholder="Parlez-nous de vous..." />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -2 }}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-${stat.color}-100 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className={`p-1 sm:p-1.5 md:p-2 bg-gradient-to-r ${stat.gradient} rounded-lg shadow-md`}>
                  <stat.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                </div>
                <span className={`text-base sm:text-xl md:text-2xl font-bold text-${stat.color}-600`}>{stat.value}</span>
              </div>
              <p className="text-gray-600 text-[9px] xs:text-[10px] sm:text-xs font-medium truncate">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section - Responsive */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-100">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Répartition</h2>
              </div>
              <div className="h-56 xs:h-64 sm:h-72">
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-100">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Tendance mensuelle</h2>
              </div>
              <div className="h-56 xs:h-64 sm:h-72">
                <Line data={lineChartData} options={barOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Applications Section - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg mt-6 sm:mt-8 overflow-hidden border border-gray-100">
          <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Mes candidatures</h2>
                <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium">{applications.length}</span>
              </div>

              {/* Filters - Horizontal scrollable on mobile */}
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'pending', 'accepted', 'rejected', 'interviewed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] xs:text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                      activeFilter === filter
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'all' ? 'Tous' : filter === 'pending' ? 'En attente' : filter === 'accepted' ? 'Acceptés' : filter === 'rejected' ? 'Refusés' : 'Entretiens'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600 mx-auto mb-2 sm:mb-3" />
                <p className="text-gray-500 text-xs sm:text-sm">Chargement des candidatures...</p>
              </div>
            ) : getFilteredApplications().length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm sm:text-base font-medium">Aucune candidature trouvée</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Commencez à postuler dès maintenant !</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {getFilteredApplications().map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.00 }}
                    className="group bg-white border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => { setSelectedApplication(application); setShowDetailsModal(true); }}
                  >
                    <div className="flex flex-col xs:flex-row xs:items-start gap-3 xs:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            <Building2 className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base break-words">
                              {application.job_details?.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 break-words">{application.job_details?.company_details?.company_name}</p>
                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-[10px] xs:text-xs text-gray-500">
                              <span className="flex items-center gap-0.5 sm:gap-1"><MapPinIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{application.job_details?.location}</span>
                              <span className="flex items-center gap-0.5 sm:gap-1"><Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{application.job_details?.contract_type}</span>
                              <span className="flex items-center gap-0.5 sm:gap-1"><CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{formatDate(application.applied_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between xs:justify-end gap-2 sm:gap-3">
                        <div className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-medium ${getStatusColor(application.status)} border`}>
                          {getStatusIcon(application.status)}
                          <span className="hidden xs:inline">{getStatusLabel(application.status)}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips Section - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10"><Sparkles className="w-24 h-24 sm:w-32 sm:h-32" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" /></div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">Statistiques</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div><p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.total}</p><p className="text-xs sm:text-sm opacity-90">Total candidatures</p></div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div><p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.interviewed}</p><p className="text-[10px] sm:text-xs opacity-80">Entretiens</p></div>
                  <div><p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.accepted}</p><p className="text-[10px] sm:text-xs opacity-80">Acceptées</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /></div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Conseils</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {stats.total === 0 && (
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl">
                  <div className="p-1 sm:p-1.5 bg-blue-100 rounded-lg flex-shrink-0"><Rocket className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" /></div>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-700 flex-1">🚀 Commencez à postuler à des offres qui vous correspondent</p>
                </div>
              )}
              {stats.pending > 3 && (
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-amber-50 rounded-lg sm:rounded-xl">
                  <div className="p-1 sm:p-1.5 bg-amber-100 rounded-lg flex-shrink-0"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" /></div>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-700 flex-1">⏳ {stats.pending} candidatures en attente. N'hésitez pas à relancer</p>
                </div>
              )}
              {stats.rejected > 2 && (
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-rose-50 rounded-lg sm:rounded-xl">
                  <div className="p-1 sm:p-1.5 bg-rose-100 rounded-lg flex-shrink-0"><TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" /></div>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-700 flex-1">📈 Améliorez votre CV et votre lettre de motivation</p>
                </div>
              )}
              {stats.accepted > 0 && (
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-50 rounded-lg sm:rounded-xl">
                  <div className="p-1 sm:p-1.5 bg-emerald-100 rounded-lg flex-shrink-0"><Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" /></div>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-700 flex-1">🎉 Félicitations pour vos offres acceptées !</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Details Modal - Responsive */}
      <AnimatePresence>
        {showDetailsModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 sticky top-0 z-10">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-0.5 sm:mb-1">Détails de la candidature</h3>
                    <p className="text-blue-100 text-xs sm:text-sm truncate">{selectedApplication.job_details?.title}</p>
                  </div>
                  <button onClick={() => setShowDetailsModal(false)} className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg sm:rounded-xl transition-colors flex-shrink-0">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Informations de l'offre
                  </h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div>
                      <p className="text-[10px] xs:text-xs text-gray-500">Entreprise</p>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">{selectedApplication.job_details?.company_details?.company_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] xs:text-xs text-gray-500">Localisation</p>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm flex items-center gap-0.5 sm:gap-1 break-words"><MapPinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />{selectedApplication.job_details?.location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] xs:text-xs text-gray-500">Type de contrat</p>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">{selectedApplication.job_details?.contract_type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] xs:text-xs text-gray-500">Salaire</p>
                      <p className="font-medium text-emerald-600 text-xs sm:text-sm">{formatSalary(selectedApplication.job_details?.salary_min)} - {formatSalary(selectedApplication.job_details?.salary_max)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Statut
                  </h4>
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] xs:text-xs text-gray-500">Statut actuel</p>
                        <div className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mt-1 ${getStatusColor(selectedApplication.status)} border`}>
                          {getStatusIcon(selectedApplication.status)}
                          {getStatusLabel(selectedApplication.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] xs:text-xs text-gray-500">Date de candidature</p>
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatDate(selectedApplication.applied_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedApplication.cover_letter && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Lettre de motivation
                    </h4>
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{selectedApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-2">
                  <button onClick={() => setShowDetailsModal(false)} className="order-2 xs:order-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 text-xs sm:text-sm">
                    Fermer
                  </button>
                  <button onClick={() => window.location.href = `/jobs/${selectedApplication.job_offer}`} className="order-1 xs:order-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 font-medium text-xs sm:text-sm">
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Voir l'offre
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;