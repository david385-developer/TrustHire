import { useState, useEffect } from 'react';
import api from '../services/api';

const useBackendWakeup = () => {
  const [isWakingUp, setIsWakingUp] = useState(true);

  useEffect(() => {
    const pingBackend = async () => {
      try {
        // Try to hit /auth/me or /health
        // Since api.baseURL usually ends in /api, we can just use /health if it's there
        await api.get('/health');
        setIsWakingUp(false);
      } catch (error) {
        console.log('Backend waking up...', error);
        // If it fails, retry after a short delay
        setTimeout(pingBackend, 3000);
      }
    };

    pingBackend();
  }, []);

  return { isWakingUp };
};

export default useBackendWakeup;
