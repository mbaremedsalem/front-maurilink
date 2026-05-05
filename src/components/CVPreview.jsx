import React from 'react';
import { motion } from 'framer-motion';
import { HiX, HiDownload, HiPrinter } from 'react-icons/hi';

const CVPreview = ({ resume, onClose, onPDF }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Aperçu du CV</h2>
          <div className="flex gap-2">
            <button
              onClick={onPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <HiDownload className="h-4 w-4" />
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8 pb-8 border-b">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resume.personal_info?.first_name} {resume.personal_info?.last_name}
            </h1>
            <p className="text-lg text-gray-600">{resume.title}</p>
            <div className="flex justify-center gap-4 mt-3 text-sm text-gray-500">
              {resume.personal_info?.email && <span>📧 {resume.personal_info.email}</span>}
              {resume.personal_info?.phone && <span>📞 {resume.personal_info.phone}</span>}
              {resume.personal_info?.address && <span>📍 {resume.personal_info.address}</span>}
            </div>
          </div>

          {/* Expériences */}
          {resume.experience?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                Expériences Professionnelles
              </h2>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-gray-600 text-sm">
                    {exp.company} | {exp.start_date} - {exp.end_date || 'Présent'}
                  </p>
                  <p className="text-gray-700 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Formations */}
          {resume.education?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                Formation
              </h2>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-600 text-sm">{edu.school} | {edu.year}</p>
                  <p className="text-gray-700 mt-1">{edu.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Compétences */}
          {resume.skills?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                Compétences
              </h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Langues */}
          {resume.languages?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">
                Langues
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {resume.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-gray-600">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CVPreview;