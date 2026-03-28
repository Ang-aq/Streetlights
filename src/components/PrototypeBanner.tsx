import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cip-banner-dismissed';

export default function PrototypeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex-none bg-amber-50 border-b border-amber-300 px-4 py-2 flex items-start gap-3 text-sm">
      <span className="text-amber-600 font-bold mt-0.5 flex-none">!</span>
      <p className="flex-1 text-amber-800 leading-snug">
        <strong>Prototype:</strong> Project data is from the City of Richmond CIP Dashboard and
        may not reflect the most current information. Locations are approximate.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss notice"
        className="flex-none text-amber-600 hover:text-amber-800 font-bold text-base leading-none"
      >
        &times;
      </button>
    </div>
  );
}
