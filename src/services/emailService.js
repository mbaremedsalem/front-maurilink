// src/services/emailService.js
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const sendContactEmail = async (formData) => {
  try {
    const templateParams = {
      from_name: formData.name,      // Va dans "From Name" (visible)
      from_email: formData.email,    // Va dans "Reply-To"
      subject: formData.subject,
      message: formData.message,
      to_email: 'maurilinkk@gmail.com'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    return { success: true, message: 'Message envoyé avec succès' };
  } catch (error) {
    console.error('Erreur EmailJS:', error);
    return { success: false, message: 'Erreur lors de l\'envoi' };
  }
};