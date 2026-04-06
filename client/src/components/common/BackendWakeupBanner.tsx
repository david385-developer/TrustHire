import React from 'react';
import { Loader2 } from 'lucide-react';
import useBackendWakeup from '../../hooks/useBackendWakeup';

const BackendWakeupBanner = () => {
  const { isWakingUp } = useBackendWakeup();

  if (!isWakingUp) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-[#1B4D3E] text-white py-2 px-4 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm font-medium">Connecting to server, please wait...</span>
    </div>
  );
};

export default BackendWakeupBanner;
