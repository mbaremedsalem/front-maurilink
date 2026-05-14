// src/services/emailService.js
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

// Initialiser EmailJS avec votre clé publique
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const sendContactEmail = async (formData) => {
  try {
    // Paramètres à envoyer à EmailJS
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      // Ajoutez d'autres champs si nécessaire
      to_name: 'MauriLink Team',
      reply_to: formData.email
    };

    console.log('Envoi en cours...', templateParams);

    // Envoyer l'email
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('Succès!', response);
    return { 
      success: true, 
      message: 'Email envoyé avec succès',
      data: response 
    };
  } catch (error) {
    console.error('Erreur EmailJS:', error);
    return { 
      success: false, 
      message: 'Erreur lors de l\'envoi',
      error: error.text || error.message 
    };
  }
};