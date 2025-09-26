/**
 * Utility functions for handling Firestore data conversion
 */

/**
 * Safely converts a Firestore timestamp to a JavaScript Date
 * @param timestamp - Firestore timestamp or any value
 * @param fallback - Fallback date if conversion fails
 * @returns JavaScript Date object
 */
export const safeToDate = (timestamp: any, fallback: Date = new Date()): Date => {
  if (!timestamp) return fallback;
  
  // If it's already a Date object
  if (timestamp instanceof Date) return timestamp;
  
  // If it has a toDate method (Firestore Timestamp)
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's a string that can be parsed
  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? fallback : parsed;
  }
  
  // If it's a number (Unix timestamp)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  return fallback;
};

/**
 * Converts Firestore document data to a safe format with proper date handling
 * @param doc - Firestore document snapshot
 * @param dateFields - Array of field names that should be converted to dates
 * @returns Object with converted dates
 */
export const convertFirestoreDoc = (doc: any, dateFields: string[] = []) => {
  const data = doc.data();
  const converted = { id: doc.id, ...data };
  
  dateFields.forEach(field => {
    if (data[field]) {
      converted[field] = safeToDate(data[field]);
    }
  });
  
  return converted;
};

/**
 * Converts an array of Firestore documents with date field conversion
 * @param docs - Array of Firestore document snapshots
 * @param dateFields - Array of field names that should be converted to dates
 * @returns Array of converted documents
 */
export const convertFirestoreDocs = (docs: any[], dateFields: string[] = []) => {
  return docs.map(doc => convertFirestoreDoc(doc, dateFields));
};
