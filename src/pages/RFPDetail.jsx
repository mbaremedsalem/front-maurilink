// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useSelector } from 'react-redux';
// import { useTranslation } from 'react-i18next';
// import { rfpService } from '../api/services';
// import { 
//   HiArrowLeft, 
//   HiLocationMarker, 
//   HiCurrencyDollar, 
//   HiCalendar, 
//   HiBriefcase,
//   HiOfficeBuilding,
//   HiDocumentDownload,
//   HiDocumentText,
//   HiX,
//   HiUserCircle,
//   HiMail,
//   HiCheck,
//   HiExclamationCircle
// } from 'react-icons/hi';
// import { toast } from 'react-toastify';

// const RFPDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { t, i18n } = useTranslation();
//   const isRTL = i18n.language === 'ar';
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const [rfp, setRfp] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showProposalModal, setShowProposalModal] = useState(false);
//   const [showProposalsList, setShowProposalsList] = useState(false);
//   const [proposals, setProposals] = useState([]);
//   const [loadingProposals, setLoadingProposals] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [hasApplied, setHasApplied] = useState(false);
//   const [checkingApplication, setCheckingApplication] = useState(false);
//   const [proposalData, setProposalData] = useState({
//     cover_letter: '',
//     proposed_amount: '',
//     proposed_timeline: '',
//   });

//   useEffect(() => {
//     fetchRfp();
//     if (user?.user_type === 'company') {
//       fetchProposals();
//     }
//     if (isAuthenticated && user?.user_type === 'candidate') {
//       checkIfAlreadyApplied();
//     }
//     window.scrollTo(0, 0);
//   }, [id, user, isAuthenticated]);

//   const checkIfAlreadyApplied = async () => {
//     try {
//       setCheckingApplication(true);
//       const response = await rfpService.getCompanyProposals();
//       const proposalsData = response.data.results || response.data;
//       const alreadyApplied = proposalsData.some(p => p.rfp === parseInt(id));
//       setHasApplied(alreadyApplied);
//     } catch (error) {
//       console.error('Error checking application status:', error);
//     } finally {
//       setCheckingApplication(false);
//     }
//   };

//   const getLogoUrl = (logoPath) => {
//     if (!logoPath) return null;
//     if (logoPath.startsWith('http')) return logoPath;
//     const baseUrl = process.env.REACT_APP_API_URL || 'https://back.maurilink.site';
//     return `${baseUrl}${logoPath}`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return t('rfpDetail.not_specified');
//     const date = new Date(dateString);
//     return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric'
//     });
//   };

//   const fetchRfp = async () => {
//     try {
//       setLoading(true);
//       const response = await rfpService.getById(id);
//       setRfp(response.data);
//     } catch (error) {
//       console.error('Error fetching RFP:', error);
//       toast.error(t('rfpDetail.errors.load_error'));
//       navigate('/rfps');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProposals = async () => {
//     try {
//       setLoadingProposals(true);
//       const response = await rfpService.getCompanyProposals();
//       const proposalsData = response.data.results || response.data;
//       const rfpProposals = proposalsData.filter(p => p.rfp === parseInt(id));
//       setProposals(rfpProposals);
//     } catch (error) {
//       console.error('Error fetching proposals:', error);
//     } finally {
//       setLoadingProposals(false);
//     }
//   };

//   const handleProposalSubmit = async (e) => {
//     e.preventDefault();
    
//     // Vérification de connexion
//     if (!isAuthenticated) {
//       toast.warning(t('rfpDetail.messages.login_to_submit'), {
//         position: "top-right",
//         autoClose: 5000,
//       });
//       setTimeout(() => {
//         navigate('/login', { state: { from: `/rfps/${id}` } });
//       }, 2000);
//       return;
//     }

//     // Vérification du type d'utilisateur
//     if (user?.user_type !== 'candidate') {
//       toast.warning(t('rfpDetail.messages.only_candidates'));
//       return;
//     }

//     // Vérification si déjà postulé
//     if (hasApplied) {
//       toast.error(t('rfpDetail.errors.already_applied'));
//       return;
//     }

//     // Validations des champs
//     if (!proposalData.cover_letter.trim()) {
//       toast.error(t('rfpDetail.errors.cover_letter_required'));
//       return;
//     }
//     if (!proposalData.proposed_amount) {
//       toast.error(t('rfpDetail.errors.amount_required'));
//       return;
//     }
//     if (!proposalData.proposed_timeline.trim()) {
//       toast.error(t('rfpDetail.errors.timeline_required'));
//       return;
//     }

//     setSubmitting(true);
    
//     try {
//       const formData = new FormData();
//       formData.append('rfp', id);
//       formData.append('cover_letter', proposalData.cover_letter);
//       formData.append('proposed_amount', proposalData.proposed_amount);
//       formData.append('proposed_timeline', proposalData.proposed_timeline);
      
//       if (selectedFile) {
//         formData.append('proposal_document', selectedFile);
//       }

//       const response = await rfpService.submitProposal(formData);
      
//       if (response.data) {
//         toast.success(t('rfpDetail.messages.proposal_sent'));
//         setShowProposalModal(false);
//         setHasApplied(true); // Marquer comme déjà postulé
//         setProposalData({
//           cover_letter: '',
//           proposed_amount: '',
//           proposed_timeline: '',
//         });
//         setSelectedFile(null);
//         const fileInput = document.getElementById('proposal_document');
//         if (fileInput) fileInput.value = '';
//       }
//     } catch (error) {
//       console.error('Error submitting proposal:', error);
      
//       // Gestion spécifique des erreurs
//       let errorMessage = t('rfpDetail.errors.submit_error');
      
//       if (error.response?.data) {
//         const data = error.response.data;
        
//         // Message "déjà postulé"
//         if (typeof data === 'string' && data.includes('déjà postulé')) {
//           errorMessage = t('rfpDetail.errors.already_applied');
//           setHasApplied(true);
//         }
//         // Message d'erreur spécifique
//         else if (data.message) {
//           errorMessage = data.message;
//         }
//         else if (data.detail) {
//           errorMessage = data.detail;
//         }
//         else if (data.proposal_document && Array.isArray(data.proposal_document)) {
//           errorMessage = data.proposal_document[0];
//         }
//       }
      
//       toast.error(errorMessage);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//       if (!allowedTypes.includes(file.type)) {
//         toast.error(t('rfpDetail.errors.invalid_file_type'));
//         e.target.value = '';
//         return;
//       }
//       if (file.size > 10 * 1024 * 1024) {
//         toast.error(t('rfpDetail.errors.file_too_large'));
//         e.target.value = '';
//         return;
//       }
//       setSelectedFile(file);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       pending: { label: t('rfpDetail.proposal_status.pending'), color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
//       accepted: { label: t('rfpDetail.proposal_status.accepted'), color: 'bg-green-100 text-green-800 border-green-200' },
//       rejected: { label: t('rfpDetail.proposal_status.rejected'), color: 'bg-red-100 text-red-800 border-red-200' },
//       reviewed: { label: t('rfpDetail.proposal_status.reviewed'), color: 'bg-blue-100 text-blue-800 border-blue-200' }
//     };
//     const config = statusConfig[status] || statusConfig.pending;
//     return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
//   };

//   const getRFPStatusBadge = () => {
//     if (!rfp) return null;
//     if (rfp.status === 'closed') {
//       return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">{t('rfpDetail.rfp_status.closed')}</span>;
//     }
//     if (rfp.remaining_days <= 0) {
//       return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">{t('rfpDetail.rfp_status.expired')}</span>;
//     }
//     if (rfp.remaining_days <= 3) {
//       return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">🔥 {t('rfpDetail.rfp_status.urgent')} - {rfp.remaining_days} {t('rfpDetail.rfp_status.days_left')}</span>;
//     }
//     return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{t('rfpDetail.rfp_status.open')} - {rfp.remaining_days} {t('rfpDetail.rfp_status.days_left')}</span>;
//   };

//   const updateProposalStatus = async (proposalId, status) => {
//     try {
//       await rfpService.updateProposalStatus(proposalId, { status });
//       toast.success(status === 'accepted' ? t('rfpDetail.messages.accepted') : t('rfpDetail.messages.rejected'));
//       fetchProposals();
//     } catch (error) {
//       console.error('Error updating proposal status:', error);
//       toast.error(t('rfpDetail.errors.status_update_error'));
//     }
//   };

//   if (loading) {
//     return (
//       <div className={`min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 ${isRTL ? 'text-right' : ''}`}>
//         <div className="relative">
//           <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
//           <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!rfp) return null;

//   const canSubmitProposal = rfp.status === 'open' && rfp.remaining_days > 0 && user?.user_type === 'candidate' && !hasApplied && !checkingApplication;
//   const isCompany = user?.user_type === 'company';
//   const isExpired = rfp.status === 'closed' || rfp.remaining_days <= 0;

//   return (
//     <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 ${isRTL ? 'text-right' : ''}`}>
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//         <Link
//           to="/rfps"
//           className={`inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
//         >
//           <HiArrowLeft className={`group-hover:${isRTL ? 'translate-x-1' : '-translate-x-1'} transition-transform ${isRTL ? 'rotate-180' : ''}`} />
//           {t('rfpDetail.back_button')}
//         </Link>

//         {/* Message d'information si non connecté */}
//         {!isAuthenticated && (
//           <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
//             <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
//               <HiExclamationCircle className="h-6 w-6 text-blue-600" />
//               <div>
//                 <p className="text-blue-800 font-medium">
//                   {t('rfpDetail.messages.login_required')}
//                 </p>
//                 <Link to="/login" className="text-blue-600 text-sm hover:underline">
//                   {t('rfpDetail.messages.click_to_login')}
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Message si déjà postulé */}
//         {isAuthenticated && user?.user_type === 'candidate' && hasApplied && (
//           <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
//             <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
//               <HiCheck className="h-6 w-6 text-green-600" />
//               <div>
//                 <p className="text-green-800 font-medium">
//                   {t('rfpDetail.messages.already_applied_message')}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//             {/* Header avec gradient */}
//             <div className="relative">
//               <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-6 md:px-8 py-8 relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
//                 <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                
//                 <div className="relative z-10">
//                   <div className={`flex flex-col md:flex-row gap-6 items-start md:items-center ${isRTL ? 'md:flex-row-reverse' : ''}`}>
//                     <div className="flex-shrink-0">
//                       {rfp.company_logo ? (
//                         <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-lg overflow-hidden flex items-center justify-center p-2">
//                           <img
//                             src={getLogoUrl(rfp.company_logo)}
//                             alt={rfp.company_name}
//                             className="w-full h-full object-contain"
//                             onError={(e) => {
//                               e.target.onerror = null;
//                               e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rfp.company_name || 'Company')}&background=ffffff&color=3b82f6&size=120&rounded=true&bold=true`;
//                             }}
//                           />
//                         </div>
//                       ) : (
//                         <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center">
//                           <HiOfficeBuilding className="h-10 w-10 md:h-12 md:w-12 text-blue-600" />
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
//                       <div className={`flex flex-wrap items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
//                         <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
//                           {rfp.contract_type}
//                         </span>
//                         {getRFPStatusBadge()}
//                       </div>
//                       <h1 className="text-2xl md:text-3xl font-bold mb-2">{rfp.title}</h1>
//                       <div className={`flex items-center gap-2 text-blue-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
//                         <HiOfficeBuilding className="h-5 w-5" />
//                         <p className="text-lg">{rfp.company_name}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Contenu principal */}
//             <div className={`p-6 md:p-8 ${isRTL ? 'text-right' : ''}`}>
//               {/* Le reste du contenu reste identique */}
//               {/* Informations clés */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <div className="bg-blue-50 rounded-xl p-4">
//                   <HiLocationMarker className="h-5 w-5 text-blue-600 mb-2" />
//                   <p className="text-sm text-gray-600">{t('rfpDetail.location')}</p>
//                   <p className="font-semibold text-gray-900">{rfp.location}</p>
//                 </div>
//                 <div className="bg-green-50 rounded-xl p-4">
//                   <HiCurrencyDollar className="h-5 w-5 text-green-600 mb-2" />
//                   <p className="text-sm text-gray-600">{t('rfpDetail.budget')}</p>
//                   <p className="font-semibold text-gray-900">
//                     {parseInt(rfp.budget_min).toLocaleString()} - {parseInt(rfp.budget_max).toLocaleString()} MRU
//                   </p>
//                 </div>
//                 <div className="bg-purple-50 rounded-xl p-4">
//                   <HiCalendar className="h-5 w-5 text-purple-600 mb-2" />
//                   <p className="text-sm text-gray-600">{t('rfpDetail.deadline')}</p>
//                   <p className="font-semibold text-gray-900">{formatDate(rfp.submission_deadline)}</p>
//                 </div>
//                 <div className="bg-orange-50 rounded-xl p-4">
//                   <HiBriefcase className="h-5 w-5 text-orange-600 mb-2" />
//                   <p className="text-sm text-gray-600">{t('rfpDetail.duration')}</p>
//                   <p className="font-semibold text-gray-900">{rfp.duration}</p>
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-900 mb-4">{t('rfpDetail.project_description')}</h2>
//                 <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{rfp.description}</p>
//               </div>

//               {/* Prérequis */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-900 mb-4">{t('rfpDetail.requirements')}</h2>
//                 <div className="bg-gray-50 rounded-xl p-6">
//                   <p className="text-gray-700 whitespace-pre-wrap">{rfp.requirements}</p>
//                 </div>
//               </div>

//               {/* Pièce jointe */}
//               {rfp.attachment && (
//                 <div className="mb-8">
//                   <h2 className="text-xl font-bold text-gray-900 mb-4">{t('rfpDetail.attachments')}</h2>
//                   <a
//                     href={rfp.attachment}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
//                   >
//                     <HiDocumentDownload className="h-5 w-5" />
//                     {t('rfpDetail.download_file')}
//                   </a>
//                 </div>
//               )}

//               {/* Boutons d'action avec messages */}
//               <div className={`flex flex-wrap gap-4 justify-center pt-6 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
//                 {isAuthenticated && user?.user_type === 'candidate' && hasApplied && (
//                   <div className="w-full text-center">
//                     <p className="text-green-600 font-medium">
//                       ✅ {t('rfpDetail.messages.already_applied_message')}
//                     </p>
//                   </div>
//                 )}
                
//                 {isAuthenticated && user?.user_type === 'candidate' && isExpired && !hasApplied && (
//                   <div className="w-full text-center">
//                     <p className="text-red-600 font-medium">
//                       ⚠️ {t('rfpDetail.messages.deadline_passed')}
//                     </p>
//                   </div>
//                 )}
                
//                 {canSubmitProposal && (
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setShowProposalModal(true)}
//                     className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
//                   >
//                     {t('rfpDetail.submit_proposal')}
//                   </motion.button>
//                 )}
                
//                 {!isAuthenticated && (
//                   <Link
//                     to="/login"
//                     className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
//                   >
//                     {t('rfpDetail.messages.login_to_submit_button')}
//                   </Link>
//                 )}
                
//                 {isCompany && proposals.length > 0 && (
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setShowProposalsList(true)}
//                     className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
//                   >
//                     {t('rfpDetail.view_proposals', { count: proposals.length })}
//                   </motion.button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* Modal de soumission de proposition - identique */}
//       <AnimatePresence>
//         {showProposalModal && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//             >
//               <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white sticky top-0">
//                 <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
//                   <h3 className="text-xl font-bold">{t('rfpDetail.submit_proposal')}</h3>
//                   <button onClick={() => setShowProposalModal(false)} className="p-1 hover:bg-white/20 rounded-lg">
//                     <HiX className="w-5 h-5" />
//                   </button>
//                 </div>
//                 <p className="text-blue-100 text-sm mt-1">{rfp.title}</p>
//               </div>

//               <form onSubmit={handleProposalSubmit} className={`p-6 space-y-5 ${isRTL ? 'text-right' : ''}`}>
//                 {/* Formulaire identique */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     {t('rfpDetail.cover_letter')} *
//                   </label>
//                   <textarea
//                     required
//                     rows="6"
//                     value={proposalData.cover_letter}
//                     onChange={(e) => setProposalData({...proposalData, cover_letter: e.target.value})}
//                     className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
//                     placeholder={t('rfpDetail.cover_letter_placeholder')}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       {t('rfpDetail.proposed_amount')} (MRU) *
//                     </label>
//                     <input
//                       type="number"
//                       required
//                       value={proposalData.proposed_amount}
//                       onChange={(e) => setProposalData({...proposalData, proposed_amount: e.target.value})}
//                       className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
//                       placeholder={t('rfpDetail.amount_placeholder')}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       {t('rfpDetail.proposed_timeline')} *
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={proposalData.proposed_timeline}
//                       onChange={(e) => setProposalData({...proposalData, proposed_timeline: e.target.value})}
//                       className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
//                       placeholder={t('rfpDetail.timeline_placeholder')}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     {t('rfpDetail.proposal_document')}
//                   </label>
//                   <input
//                     id="proposal_document"
//                     type="file"
//                     accept=".pdf,.doc,.docx"
//                     onChange={handleFileChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     {t('rfpDetail.file_hint')}
//                   </p>
//                 </div>

//                 <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
//                   <button
//                     type="submit"
//                     disabled={submitting}
//                     className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
//                   >
//                     {submitting ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         {t('rfpDetail.sending')}
//                       </div>
//                     ) : (
//                       t('rfpDetail.send_proposal')
//                     )}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setShowProposalModal(false)}
//                     className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
//                   >
//                     {t('rfpDetail.cancel')}
//                   </button>
//                 </div>
//               </form>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Modal de visualisation des propositions - identique */}
//       <AnimatePresence>
//         {showProposalsList && (
//           // ... même modal que précédemment
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
//             >
//               <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white sticky top-0">
//                 <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
//                   <div>
//                     <h3 className="text-xl font-bold">{t('rfpDetail.received_proposals')}</h3>
//                     <p className="text-emerald-100 text-sm mt-1">{rfp.title}</p>
//                   </div>
//                   <button onClick={() => setShowProposalsList(false)} className="p-1 hover:bg-white/20 rounded-lg">
//                     <HiX className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6">
//                 {loadingProposals ? (
//                   <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-2 text-gray-500">{t('rfpDetail.loading_proposals')}</p>
//                   </div>
//                 ) : proposals.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                       <HiDocumentText className="w-8 h-8 text-gray-400" />
//                     </div>
//                     <p className="text-gray-500">{t('rfpDetail.no_proposals')}</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {proposals.map((proposal) => (
//                       <div key={proposal.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
//                         {/* Contenu de la proposition - identique */}
//                         <div className={`flex flex-wrap justify-between items-start gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
//                           <div>
//                             <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
//                               <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
//                                 <HiUserCircle className="w-6 h-6 text-white" />
//                               </div>
//                               <div>
//                                 <h4 className="font-semibold text-gray-900">{proposal.candidate_name}</h4>
//                                 <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
//                                   <HiMail className="w-3.5 h-3.5" />
//                                   <span>{proposal.candidate_email}</span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                           <div className={`flex flex-col gap-2 ${isRTL ? 'items-start' : 'items-end'}`}>
//                             {getStatusBadge(proposal.status)}
//                             <span className="text-xs text-gray-400">
//                               {t('rfpDetail.submitted_on')} {formatDate(proposal.submitted_date)}
//                             </span>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//                           <div className="bg-green-50 rounded-lg p-3">
//                             <p className="text-xs text-gray-500">{t('rfpDetail.proposed_amount')}</p>
//                             <p className="font-semibold text-green-600">{parseInt(proposal.proposed_amount).toLocaleString()} MRU</p>
//                           </div>
//                           <div className="bg-blue-50 rounded-lg p-3">
//                             <p className="text-xs text-gray-500">{t('rfpDetail.proposed_timeline')}</p>
//                             <p className="font-semibold text-blue-600">{proposal.proposed_timeline}</p>
//                           </div>
//                         </div>

//                         <div className="mb-4">
//                           <p className="text-xs text-gray-500 mb-1">{t('rfpDetail.cover_letter')}</p>
//                           <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">{proposal.cover_letter}</p>
//                         </div>

//                         {proposal.proposal_document && (
//                           <div className="mb-4">
//                             <a
//                               href={proposal.proposal_document}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
//                             >
//                               <HiDocumentDownload className="w-4 h-4" />
//                               {t('rfpDetail.download_document')}
//                             </a>
//                           </div>
//                         )}

//                         {proposal.status === 'pending' && (
//                           <div className={`flex gap-3 pt-3 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
//                             <button
//                               onClick={() => updateProposalStatus(proposal.id, 'accepted')}
//                               className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
//                             >
//                               <HiCheck className="w-4 h-4 inline mr-1" />
//                               {t('rfpDetail.accept')}
//                             </button>
//                             <button
//                               onClick={() => updateProposalStatus(proposal.id, 'rejected')}
//                               className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
//                             >
//                               <HiX className="w-4 h-4 inline mr-1" />
//                               {t('rfpDetail.reject')}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default RFPDetail;




import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { rfpService } from '../api/services';
import { 
  HiArrowLeft, 
  HiLocationMarker, 
  HiCurrencyDollar, 
  HiCalendar, 
  HiBriefcase,
  HiOfficeBuilding,
  HiDocumentDownload,
  HiDocumentText,
  HiX,
  HiUserCircle,
  HiMail,
  HiCheck,
  HiExclamationCircle,
  HiClock,
  HiTag,
  HiClipboardList,
  HiStar,
  HiUserGroup,
  HiChartBar,
  HiShieldCheck,
  HiTrendingUp,
  HiGlobeAlt,
  HiPhone,
  HiAtSymbol,
  HiCalendar as HiCalendarIcon,
  HiCheckCircle
} from 'react-icons/hi';
import { toast } from 'react-toastify';

const RFPDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showProposalsList, setShowProposalsList] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [proposalData, setProposalData] = useState({
    cover_letter: '',
    proposed_amount: '',
    proposed_timeline: '',
  });
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchRfp();
    if (user?.user_type === 'company') {
      fetchProposals();
    }
    if (isAuthenticated && user?.user_type === 'candidate') {
      checkIfAlreadyApplied();
    }
    window.scrollTo(0, 0);
  }, [id, user, isAuthenticated]);

  const checkIfAlreadyApplied = async () => {
    try {
      setCheckingApplication(true);
      const response = await rfpService.getCompanyProposals();
      const proposalsData = response.data.results || response.data;
      const alreadyApplied = proposalsData.some(p => p.rfp === parseInt(id));
      setHasApplied(alreadyApplied);
    } catch (error) {
      console.error('Error checking application status:', error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'https://back.maurilink.site';
    return `${baseUrl}${logoPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('rfpDetail.not_specified');
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return t('rfpDetail.not_specified');
    const date = new Date(dateString);
    return date.toLocaleString(i18n.language === 'ar' ? 'ar-MR' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchRfp = async () => {
    try {
      setLoading(true);
      const response = await rfpService.getById(id);
      setRfp(response.data);
    } catch (error) {
      console.error('Error fetching RFP:', error);
      toast.error(t('rfpDetail.errors.load_error'));
      navigate('/rfps');
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      setLoadingProposals(true);
      const response = await rfpService.getCompanyProposals();
      const proposalsData = response.data.results || response.data;
      const rfpProposals = proposalsData.filter(p => p.rfp === parseInt(id));
      setProposals(rfpProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.warning(t('rfpDetail.messages.login_to_submit'));
      setTimeout(() => {
        navigate('/login', { state: { from: `/rfps/${id}` } });
      }, 2000);
      return;
    }

    if (user?.user_type !== 'candidate') {
      toast.warning(t('rfpDetail.messages.only_candidates'));
      return;
    }

    if (hasApplied) {
      toast.error(t('rfpDetail.errors.already_applied'));
      return;
    }

    if (!proposalData.cover_letter.trim()) {
      toast.error(t('rfpDetail.errors.cover_letter_required'));
      return;
    }
    if (!proposalData.proposed_amount) {
      toast.error(t('rfpDetail.errors.amount_required'));
      return;
    }
    if (!proposalData.proposed_timeline.trim()) {
      toast.error(t('rfpDetail.errors.timeline_required'));
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('rfp', id);
      formData.append('cover_letter', proposalData.cover_letter);
      formData.append('proposed_amount', proposalData.proposed_amount);
      formData.append('proposed_timeline', proposalData.proposed_timeline);
      
      if (selectedFile) {
        formData.append('proposal_document', selectedFile);
      }

      const response = await rfpService.submitProposal(formData);
      
      if (response.data) {
        toast.success(t('rfpDetail.messages.proposal_sent'));
        setShowProposalModal(false);
        setHasApplied(true);
        setProposalData({
          cover_letter: '',
          proposed_amount: '',
          proposed_timeline: '',
        });
        setSelectedFile(null);
        const fileInput = document.getElementById('proposal_document');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      
      let errorMessage = t('rfpDetail.errors.submit_error');
      
      if (error.response?.data) {
        const data = error.response.data;
        
        if (typeof data === 'string' && (data.includes('déjà postulé') || data.includes('already applied'))) {
          errorMessage = t('rfpDetail.errors.already_applied');
          setHasApplied(true);
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.proposal_document && Array.isArray(data.proposal_document)) {
          errorMessage = data.proposal_document[0];
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('rfpDetail.errors.invalid_file_type'));
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('rfpDetail.errors.file_too_large'));
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: t('rfpDetail.proposal_status.pending'), color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: HiClock },
      accepted: { label: t('rfpDetail.proposal_status.accepted'), color: 'bg-green-100 text-green-800 border-green-200', icon: HiCheckCircle },
      rejected: { label: t('rfpDetail.proposal_status.rejected'), color: 'bg-red-100 text-red-800 border-red-200', icon: HiX },
      reviewed: { label: t('rfpDetail.proposal_status.reviewed'), color: 'bg-blue-100 text-blue-800 border-blue-200', icon: HiStar }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getRFPStatusBadge = () => {
    if (!rfp) return null;
    
    if (rfp.status === 'closed') {
      return (
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <HiX className="w-4 h-4" /> {t('rfpDetail.rfp_status.closed')}
        </span>
      );
    }
    if (rfp.remaining_days <= 0) {
      return (
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <HiClock className="w-4 h-4" /> {t('rfpDetail.rfp_status.expired')}
        </span>
      );
    }
    if (rfp.remaining_days <= 3) {
      return (
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 animate-pulse">
          🔥 {t('rfpDetail.rfp_status.urgent')} - {rfp.remaining_days} {t('rfpDetail.rfp_status.days_left')}
        </span>
      );
    }
    return (
      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
        <HiCheck className="w-4 h-4" /> {t('rfpDetail.rfp_status.open')} - {rfp.remaining_days} {t('rfpDetail.rfp_status.days_left')}
      </span>
    );
  };

  const updateProposalStatus = async (proposalId, status) => {
    try {
      await rfpService.updateProposalStatus(proposalId, { status });
      toast.success(status === 'accepted' ? t('rfpDetail.messages.accepted') : t('rfpDetail.messages.rejected'));
      fetchProposals();
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error(t('rfpDetail.errors.status_update_error'));
    }
  };

  const getContractTypeIcon = (type) => {
    const icons = {
      'FREELANCE': HiUserGroup,
      'CDI': HiBriefcase,
      'CDD': HiCalendarIcon,
      'STAGE': HiStar,
    };
    const Icon = icons[type] || HiBriefcase;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          <p className="mt-4 text-gray-500 animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!rfp) return null;

  const canSubmitProposal = rfp.status === 'open' && rfp.remaining_days > 0 && user?.user_type === 'candidate' && !hasApplied && !checkingApplication;
  const isCompany = user?.user_type === 'company';
  const isExpired = rfp.status === 'closed' || rfp.remaining_days <= 0;
  const ContractIcon = getContractTypeIcon(rfp.contract_type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <Link
          to="/rfps"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group mb-6"
        >
          <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          {t('rfpDetail.back_button')}
        </Link>

        {/* Messages d'information */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <HiExclamationCircle className="h-6 w-6 text-blue-600" />
              <div className="flex-1">
                <p className="text-blue-800 font-medium">{t('rfpDetail.messages.login_required')}</p>
                <Link to="/login" className="text-blue-600 text-sm hover:underline inline-flex items-center gap-1">
                  {t('rfpDetail.messages.click_to_login')} →
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {isAuthenticated && user?.user_type === 'candidate' && hasApplied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <HiCheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">{t('rfpDetail.messages.already_applied_message')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* En-tête principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
        >
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-6 md:px-8 py-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-shrink-0">
                  {rfp.company_logo ? (
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-2 transform hover:scale-105 transition-transform duration-300">
                      <img
                        src={getLogoUrl(rfp.company_logo)}
                        alt={rfp.company_name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rfp.company_name || 'Company')}&background=ffffff&color=3b82f6&size=120&rounded=true&bold=true`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                      <HiOfficeBuilding className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      {ContractIcon}
                      {rfp.contract_type}
                    </span>
                    {getRFPStatusBadge()}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{rfp.title}</h1>
                  <div className="flex items-center gap-2 text-blue-100">
                    <HiOfficeBuilding className="h-5 w-5" />
                    <p className="text-lg">{rfp.company_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="border-b border-gray-200 px-6 md:px-8">
            <div className="flex gap-6 overflow-x-auto">
              {['details', 'criteria', 'company'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-2 font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t(`rfpDetail.tabs.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6 md:p-8">
            {/* Onglet Détails */}
            {activeTab === 'details' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Informations clés en grille */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <HiLocationMarker className="h-6 w-6 text-blue-600 mb-2" />
                    <p className="text-xs text-gray-600 uppercase tracking-wide">{t('rfpDetail.location')}</p>
                    <p className="font-semibold text-gray-900 mt-1">{rfp.location}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <HiCurrencyDollar className="h-6 w-6 text-green-600 mb-2" />
                    <p className="text-xs text-gray-600 uppercase tracking-wide">{t('rfpDetail.budget')}</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {parseInt(rfp.budget_min).toLocaleString()} - {parseInt(rfp.budget_max).toLocaleString()} MRU
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <HiCalendar className="h-6 w-6 text-purple-600 mb-2" />
                    <p className="text-xs text-gray-600 uppercase tracking-wide">{t('rfpDetail.deadline')}</p>
                    <p className="font-semibold text-gray-900 mt-1">{formatDate(rfp.submission_deadline)}</p>
                    {rfp.remaining_days > 0 && rfp.remaining_days <= 7 && (
                      <p className="text-xs text-orange-600 mt-1">⚠️ Plus que {rfp.remaining_days} jours</p>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <HiBriefcase className="h-6 w-6 text-orange-600 mb-2" />
                    <p className="text-xs text-gray-600 uppercase tracking-wide">{t('rfpDetail.duration')}</p>
                    <p className="font-semibold text-gray-900 mt-1">{rfp.duration}</p>
                  </div>
                </div>

                {/* Description et prérequis */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <HiClipboardList className="h-6 w-6 text-blue-600" />
                      {t('rfpDetail.project_description')}
                    </h2>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{rfp.description}</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <HiShieldCheck className="h-6 w-6 text-blue-600" />
                      {t('rfpDetail.requirements')}
                    </h2>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <p className="text-gray-700 whitespace-pre-wrap">{rfp.requirements}</p>
                    </div>
                  </div>

                  {rfp.attachment && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <HiDocumentDownload className="h-6 w-6 text-blue-600" />
                        {t('rfpDetail.attachments')}
                      </h2>
                      <a
                        href={rfp.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <HiDocumentDownload className="h-5 w-5" />
                        {t('rfpDetail.download_file')}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Onglet Critères */}
            {activeTab === 'criteria' && rfp.criteria && Object.keys(rfp.criteria).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HiChartBar className="h-6 w-6 text-blue-600" />
                  {t('rfpDetail.evaluation_criteria')}
                </h2>
                <div className="grid gap-4">
                  {Object.entries(rfp.criteria).map(([key, value], index) => (
                    <div key={key} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
                            Critère {index + 1}
                          </p>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{key}</h3>
                          <p className="text-gray-700">{value}</p>
                        </div>
                        <HiStar className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Onglet Entreprise */}
            {activeTab === 'company' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {rfp.company_logo ? (
                      <img
                        src={getLogoUrl(rfp.company_logo)}
                        alt={rfp.company_name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <HiOfficeBuilding className="h-10 w-10 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{rfp.company_name}</h3>
                      <p className="text-gray-600">Entreprise partenaire</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <HiGlobeAlt className="h-5 w-5 text-blue-600" />
                      <span>Mauritanie</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <HiTrendingUp className="h-5 w-5 text-blue-600" />
                      <span>Active depuis 2024</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="border-t border-gray-200 px-6 md:px-8 py-6 bg-gray-50">
            <div className="flex flex-wrap gap-4 justify-center">
              {canSubmitProposal && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProposalModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <HiDocumentText className="h-5 w-5" />
                  {t('rfpDetail.submit_proposal')}
                </motion.button>
              )}
              
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <HiUserCircle className="h-5 w-5" />
                  {t('rfpDetail.messages.login_to_submit_button')}
                </Link>
              )}
              
              {isCompany && proposals.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProposalsList(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <HiUserGroup className="h-5 w-5" />
                  {t('rfpDetail.view_proposals', { count: proposals.length })}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de soumission de proposition */}
      <AnimatePresence>
        {showProposalModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{t('rfpDetail.submit_proposal')}</h3>
                    <p className="text-blue-100 text-sm mt-1">{rfp.title}</p>
                  </div>
                  <button onClick={() => setShowProposalModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleProposalSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('rfpDetail.cover_letter')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="6"
                    value={proposalData.cover_letter}
                    onChange={(e) => setProposalData({...proposalData, cover_letter: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('rfpDetail.cover_letter_placeholder')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('rfpDetail.proposed_amount')} (MRU) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={proposalData.proposed_amount}
                      onChange={(e) => setProposalData({...proposalData, proposed_amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={t('rfpDetail.amount_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('rfpDetail.proposed_timeline')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={proposalData.proposed_timeline}
                      onChange={(e) => setProposalData({...proposalData, proposed_timeline: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={t('rfpDetail.timeline_placeholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('rfpDetail.proposal_document')}
                  </label>
                  <input
                    id="proposal_document"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('rfpDetail.file_hint')}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('rfpDetail.sending')}
                      </div>
                    ) : (
                      t('rfpDetail.send_proposal')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('rfpDetail.cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de visualisation des propositions */}
      <AnimatePresence>
        {showProposalsList && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{t('rfpDetail.received_proposals')}</h3>
                    <p className="text-emerald-100 text-sm mt-1">{rfp.title}</p>
                  </div>
                  <button onClick={() => setShowProposalsList(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {loadingProposals ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">{t('rfpDetail.loading_proposals')}</p>
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <HiDocumentText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">{t('rfpDetail.no_proposals')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <HiUserCircle className="w-7 h-7 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg">{proposal.candidate_name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <HiMail className="w-3.5 h-3.5" />
                                  <span>{proposal.candidate_email}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            {getStatusBadge(proposal.status)}
                            <span className="text-xs text-gray-400">
                              {t('rfpDetail.submitted_on')} {formatDateTime(proposal.submitted_date)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('rfpDetail.proposed_amount')}</p>
                            <p className="font-semibold text-green-600 text-lg">{parseInt(proposal.proposed_amount).toLocaleString()} MRU</p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('rfpDetail.proposed_timeline')}</p>
                            <p className="font-semibold text-blue-600 text-lg">{proposal.proposed_timeline}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{t('rfpDetail.cover_letter')}</p>
                          <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 leading-relaxed">{proposal.cover_letter}</p>
                        </div>

                        {proposal.proposal_document && (
                          <div className="mb-4">
                            <a
                              href={proposal.proposal_document}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <HiDocumentDownload className="w-4 h-4" />
                              {t('rfpDetail.download_document')}
                            </a>
                          </div>
                        )}

                        {proposal.status === 'pending' && (
                          <div className="flex gap-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => updateProposalStatus(proposal.id, 'accepted')}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:shadow-md transition-all text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <HiCheck className="w-4 h-4" />
                              {t('rfpDetail.accept')}
                            </button>
                            <button
                              onClick={() => updateProposalStatus(proposal.id, 'rejected')}
                              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-2 rounded-lg hover:shadow-md transition-all text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <HiX className="w-4 h-4" />
                              {t('rfpDetail.reject')}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RFPDetail;