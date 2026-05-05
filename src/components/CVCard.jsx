import React from 'react';
import { motion } from 'framer-motion';
import { HiDocumentText, HiPencil, HiTrash, HiEye, HiDownload, HiStar } from 'react-icons/hi';

const CVCard = ({ resume, onEdit, onDelete, onSetDefault, onPreview, onPDF }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
    >
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-white">
            <HiDocumentText className="h-6 w-6" />
            <h3 className="font-semibold text-lg truncate">{resume.title || 'Sans titre'}</h3>
          </div>
          {resume.is_default && (
            <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <HiStar className="h-3 w-3" />
              Par défaut
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{resume.personal_info?.first_name} {resume.personal_info?.last_name}</span>
          </p>
          <p className="text-xs text-gray-500">
            📅 Mis à jour le {new Date(resume.updated_at || resume.created_at).toLocaleDateString('fr-FR')}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {resume.skills?.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
            {resume.skills?.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                +{resume.skills.length - 3}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 pt-3 border-t">
          <button
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <HiEye className="h-4 w-4" />
            Voir
          </button>
          <button
            onClick={onPDF}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <HiDownload className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <HiPencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
        
        {!resume.is_default && (
          <button
            onClick={onSetDefault}
            className="w-full mt-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            Définir comme CV par défaut
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CVCard;