// src/utils/formatters.js
export const formatters = {
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString();
  },
  
  formatDateTime: (dateString) => {
    return new Date(dateString).toLocaleString();
  },
  
  formatPhone: (phone) => {
    if (!phone) return '';
    // Simple phone formatting - you can enhance this
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  },
  
  truncateText: (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }
};
