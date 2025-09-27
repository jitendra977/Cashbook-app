// src/utils/validators.js

// Individual validation functions
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (password.length > 128) {
    return 'Password must be less than 128 characters';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || !confirmPassword.trim()) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

// Strong password validation (optional)
export const validateStrongPassword = (password) => {
  const basicError = validatePassword(password);
  if (basicError) return basicError;
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&)';
  }
  return null;
};

// Form validation functions
export const validateLoginForm = (form) => {
  const errors = {};
  
  const usernameError = validateUsername(form.username);
  if (usernameError) errors.username = usernameError;
  
  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;
  
  return errors;
};

export const validateRegisterForm = (form) => {
  const errors = {};
  
  const usernameError = validateUsername(form.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;
  
  // If you have confirm password field
  if (form.confirmPassword !== undefined) {
    const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  }
  
  return errors;
};

// Helper function to check if form has errors
export const hasFormErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

// Generic form validator
export const validateForm = (form, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const validator = rules[field];
    const error = validator(form[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

// Validation rules objects for reusability
export const loginValidationRules = {
  username: validateUsername,
  password: validatePassword,
};

export const registerValidationRules = {
  username: validateUsername,
  email: validateEmail,
  password: validatePassword,
};