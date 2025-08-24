/**
 * Determines if a wedding website should be considered expired based on rules:
 * - Free sites expire 30 days after wedding date
 * - Premium sites never expire
 * - Sites created but not registered within 24h expire
 */
export const isWeddingExpired = (wedding: any): boolean => {
  if (!wedding) return true;
  
  // Premium sites never expire
  if (wedding.isPremium) return false;
  
  const now = new Date();
  
  // Check for 24h expiration for newly created sites without registration
  if (!wedding.email) {
    const createdAt = new Date(wedding.createdAt);
    // 24 hour expiration for sites without registration
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    return now > expiresAt;
  }
  
  // Check for 30 day post-wedding expiration
  if (wedding.weddingDate) {
    const weddingDate = new Date(wedding.weddingDate);
    // 30 day expiration after wedding date
    const expiresAt = new Date(weddingDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return now > expiresAt;
  }
  
  // If no wedding date is set (edge case), use creation date + 60 days
  const createdAt = new Date(wedding.createdAt);
  const expiresAt = new Date(createdAt.getTime() + 60 * 24 * 60 * 60 * 1000);
  return now > expiresAt;
};

/**
 * Gets the expiration date of a wedding website
 */
export const getExpirationDate = (wedding: any): Date | null => {
  if (!wedding) return null;
  if (wedding.isPremium) return null; // Premium sites don't expire
  
  // Use wedding date + 30 days if available
  if (wedding.weddingDate) {
    const weddingDate = new Date(wedding.weddingDate);
    return new Date(weddingDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // For newly created sites without registration, use creation date + 24h
  if (!wedding.email) {
    const createdAt = new Date(wedding.createdAt);
    return new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  }
  
  // If no wedding date is set (edge case), use creation date + 60 days
  const createdAt = new Date(wedding.createdAt);
  return new Date(createdAt.getTime() + 60 * 24 * 60 * 60 * 1000);
};

/**
 * Gets the days remaining until expiration
 */
export const getDaysUntilExpiration = (wedding: any): number | null => {
  if (!wedding || wedding.isPremium) return null;
  
  const expirationDate = getExpirationDate(wedding);
  if (!expirationDate) return null;
  
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Gets human-readable expiration status
 */
export const getExpirationStatus = (wedding: any): string => {
  if (!wedding) return 'Expired';
  if (wedding.isPremium) return 'Never expires';
  
  const daysLeft = getDaysUntilExpiration(wedding);
  
  if (daysLeft === 0) return 'Expired';
  if (daysLeft === 1) return 'Expires tomorrow';
  if (daysLeft && daysLeft <= 7) return `Expires in ${daysLeft} days`;
  if (daysLeft && daysLeft <= 30) return `Expires in ${Math.floor(daysLeft / 7)} weeks`;
  if (daysLeft) return `Expires in ${Math.floor(daysLeft / 30)} months`;
  
  return 'Expired';
};
