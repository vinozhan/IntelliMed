import { useState, useCallback } from 'react';

export default function useFormValidation(rules) {
  const [errors, setErrors] = useState({});

  const validate = useCallback((field, value) => {
    const fieldRules = rules[field];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        setErrors((prev) => ({ ...prev, [field]: rule.message || `${field} is required` }));
        return false;
      }
      if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, [field]: rule.message || 'Invalid email address' }));
        return false;
      }
      if (rule.minLength && value && value.length < rule.minLength) {
        setErrors((prev) => ({ ...prev, [field]: rule.message || `Minimum ${rule.minLength} characters` }));
        return false;
      }
      if (rule.maxLength && value && value.length > rule.maxLength) {
        setErrors((prev) => ({ ...prev, [field]: rule.message || `Maximum ${rule.maxLength} characters` }));
        return false;
      }
      if (rule.pattern && value && !rule.pattern.test(value)) {
        setErrors((prev) => ({ ...prev, [field]: rule.message || 'Invalid format' }));
        return false;
      }
      if (rule.custom && value) {
        const error = rule.custom(value);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
          return false;
        }
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return true;
  }, [rules]);

  const validateAll = useCallback((values) => {
    let valid = true;
    const newErrors = {};

    for (const field of Object.keys(rules)) {
      const value = values[field];
      for (const rule of rules[field]) {
        let error = null;
        if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
          error = rule.message || `${field} is required`;
        } else if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = rule.message || 'Invalid email address';
        } else if (rule.minLength && value && value.length < rule.minLength) {
          error = rule.message || `Minimum ${rule.minLength} characters`;
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
          error = rule.message || 'Invalid format';
        } else if (rule.custom && value) {
          error = rule.custom(value);
        }
        if (error) {
          newErrors[field] = error;
          valid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return valid;
  }, [rules]);

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  return { errors, validate, validateAll, clearError, clearAll };
}
