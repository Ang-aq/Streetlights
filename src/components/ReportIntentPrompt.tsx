interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReportIntentPrompt({ onConfirm, onCancel }: Props) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onCancel}
    >
      {/* Bottom sheet */}
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />

        {/* Icon */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
            <svg width="24" height="22" viewBox="0 0 20 18" fill="none" aria-hidden="true">
              <path d="M10 2L2 17h16L10 2z" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
              <path d="M10 8v4" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
              <circle cx="10" cy="14.5" r="1.1" fill="#d97706" />
            </svg>
          </span>
        </div>

        <h2 className="text-base font-semibold text-gray-900 text-center mb-1">
          Report an infrastructure issue?
        </h2>
        <p className="text-xs text-gray-500 text-center mb-5">
          Tap "Place a pin" then tap the map where the issue is located.
        </p>

        <button
          onClick={onConfirm}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95
                     text-white font-semibold text-sm transition-all mb-2"
        >
          Place a pin
        </button>

        <button
          onClick={onCancel}
          className="w-full py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800
                     hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
