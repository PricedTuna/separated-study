import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';

// Base theme configuration inspired by Miro Design System
const baseConfig: SweetAlertOptions = {
  // Visual
  background: '#ffffff',
  color: '#1c1c1e',
  padding: '24px',
  width: '32rem',
  backdrop: 'rgba(28, 28, 30, 0.4)',
  
  // Buttons
  confirmButtonColor: '#5b76fe',
  cancelButtonColor: '#c7cad5',
  confirmButtonText: 'Confirm',
  cancelButtonText: 'Cancel',
  
  // Icons & colors
  iconColor: '#5b76fe',
  
  // Animation
  showClass: {
    popup: 'swal2-show-miro',
    backdrop: 'swal2-backdrop-show-miro',
  },
  hideClass: {
    popup: 'swal2-hide-miro',
    backdrop: 'swal2-backdrop-hide-miro',
  },
  
  // Custom class
  customClass: {
    popup: 'swal2-popup-miro',
    title: 'swal2-title-miro',
    htmlContainer: 'swal2-html-miro',
    confirmButton: 'swal2-confirm-miro',
    cancelButton: 'swal2-cancel-miro',
    input: 'swal2-input-miro',
  },
};

// Create a mixin with the base configuration
const swalWithDefaults = Swal.mixin(baseConfig);

// Export configured Swal instance
export const swal = swalWithDefaults;

// Helper functions for common operations

export const toast = (
  message: string, 
  icon: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  const iconColors = {
    success: '#00b473',
    error: '#e3c5c5',
    warning: '#746019',
    info: '#5b76fe',
  };
  
  return swalWithDefaults.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#ffffff',
    color: '#1c1c1e',
    iconColor: iconColors[icon],
    customClass: {
      popup: 'swal2-toast-miro',
    },
  });
};

export const confirmDelete = (
  itemTitle: string,
  customText?: string
) => {
  return swalWithDefaults.fire({
    title: `Delete "${itemTitle}"?`,
    text: customText || 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#5b76fe',
    cancelButtonColor: '#c7cad5',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  });
};

export const confirmAction = (title: string, text?: string) => {
  return swalWithDefaults.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#5b76fe',
    cancelButtonColor: '#c7cad5',
  });
};

export const showError = (title: string, text?: string) => {
  return swalWithDefaults.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#5b76fe',
  });
};

export const showSuccess = (title: string, text?: string) => {
  return swalWithDefaults.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#5b76fe',
    timer: 2000,
    timerProgressBar: true,
  });
};

export default Swal;