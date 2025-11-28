/**
 * Parse validation errors from API responses
 * Converts backend error messages into user-friendly format
 */

export interface ValidationError {
  field: string;
  message: string;
}

export function parseValidationErrors(errorMessage: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Pattern: "field: constraint message; field2: constraint message"
  // Example: "title: title should not be empty, title must be a string; features.0.id: id should not be empty"
  
  if (!errorMessage) return errors;

  // Split by semicolon to get individual field errors
  const fieldErrors = errorMessage.split(';').filter(e => e.trim());

  fieldErrors.forEach((fieldError) => {
    const trimmed = fieldError.trim();
    if (!trimmed) return;

    // Split by first colon to separate field name from message
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      errors.push({
        field: 'General',
        message: trimmed,
      });
      return;
    }

    const field = trimmed.substring(0, colonIndex).trim();
    const message = trimmed.substring(colonIndex + 1).trim();

    // Format field name for display
    const displayField = formatFieldName(field);

    errors.push({
      field: displayField,
      message: formatErrorMessage(message),
    });
  });

  return errors;
}

/**
 * Format field name for display
 * Example: "features.0.title" -> "Feature 1 - Title"
 */
function formatFieldName(field: string): string {
  // Handle nested fields like "features.0.title"
  const parts = field.split('.');
  
  if (parts.length === 1) {
    // Simple field: "title" -> "Title"
    return capitalizeWords(field);
  }

  // Nested field: "features.0.title" -> "Feature 1 - Title"
  const formatted = parts.map((part, index) => {
    // If it's a number (array index), convert to ordinal
    if (/^\d+$/.test(part)) {
      const num = parseInt(part) + 1;
      return `${num}`;
    }
    return capitalizeWords(part);
  });

  // Join with appropriate separators
  if (formatted.length === 3) {
    return `${formatted[0]} ${formatted[1]} - ${formatted[2]}`;
  }

  return formatted.join(' - ');
}

/**
 * Format error message for display
 * Example: "title should not be empty, title must be a string" -> "Title should not be empty"
 */
function formatErrorMessage(message: string): string {
  if (!message) return 'Invalid value';

  // Take the first constraint message (usually the most important)
  const constraints = message.split(',').map(c => c.trim());
  let firstConstraint = constraints[0];

  // Clean up common validation messages
  firstConstraint = firstConstraint
    .replace(/^[a-z]+\s+/, '') // Remove field name prefix
    .replace(/must be/, 'Must be')
    .replace(/should not be/, 'Should not be')
    .replace(/should be/, 'Should be')
    .replace(/is not/, 'Is not')
    .replace(/is required/, 'Is required')
    .replace(/must conform to/, 'Must conform to');

  // Capitalize first letter if not already
  if (firstConstraint && firstConstraint[0] !== firstConstraint[0].toUpperCase()) {
    firstConstraint = firstConstraint.charAt(0).toUpperCase() + firstConstraint.slice(1);
  }

  return firstConstraint || 'Invalid value';
}

/**
 * Capitalize each word in a string
 */
function capitalizeWords(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extract validation errors from API error response
 */
export function extractValidationErrors(error: any): ValidationError[] {
  if (!error) return [];

  // Check if it's an API error with message
  if (error.message && typeof error.message === 'string') {
    return parseValidationErrors(error.message);
  }

  // Check if it's a response object with data
  if (error.data && error.data.message) {
    return parseValidationErrors(error.data.message);
  }

  // Fallback
  return [{
    field: 'Error',
    message: error.message || 'An error occurred while saving',
  }];
}
