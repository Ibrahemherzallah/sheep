/**
 * Utility functions for date formatting
 */

/**
 * Formats a date string to dd/mm/yy format in English
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string in dd/mm/yy format
 */
export const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '-';
  
  // Format to dd/mm/yy
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  return `${day}/${month}/${year}`;
};