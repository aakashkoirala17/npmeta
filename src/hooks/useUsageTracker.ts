import { useState, useEffect } from 'react';

const MAX_FREE_UPLOADS = 3;
// In a real app, you would verify this key with a backend.
// For this demo, we'll use a hardcoded key.
const VALID_LICENSE_KEY = 'NPMETA-PRO'; 

export function useUsageTracker() {
  const [uploadsCount, setUploadsCount] = useState(0);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const storedIsPro = localStorage.getItem('npmeta_is_pro') === 'true';
    setIsPro(storedIsPro);

    const storedDate = localStorage.getItem('npmeta_usage_date');
    const today = new Date().toDateString();
    
    if (storedDate === today) {
      const count = parseInt(localStorage.getItem('npmeta_usage_count') || '0', 10);
      setUploadsCount(count);
    } else {
      // New day, reset count
      localStorage.setItem('npmeta_usage_date', today);
      localStorage.setItem('npmeta_usage_count', '0');
      setUploadsCount(0);
    }
  }, []);

  const checkAndTrackUpload = (): boolean => {
    if (isPro) return true;
    
    if (uploadsCount < MAX_FREE_UPLOADS) {
      const newCount = uploadsCount + 1;
      setUploadsCount(newCount);
      localStorage.setItem('npmeta_usage_count', newCount.toString());
      return true; 
    }
    
    return false; 
  };

  const activatePro = (key: string): boolean => {
    if (key.trim().toUpperCase() === VALID_LICENSE_KEY) {
      localStorage.setItem('npmeta_is_pro', 'true');
      setIsPro(true);
      return true;
    }
    return false;
  };

  return {
    uploadsCount,
    maxUploads: MAX_FREE_UPLOADS,
    isPro,
    checkAndTrackUpload,
    activatePro,
  };
}
