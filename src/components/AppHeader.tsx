export default function AppHeader() {
  return (
    <header className="flex-none bg-slate-900 text-white px-4 py-2.5 flex items-center gap-3">

      {/* Streetlight icon */}
      <svg
        width="28"
        height="38"
        viewBox="0 0 32 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-none"
      >
        {/* Ambient glow behind lamp */}
        <circle cx="27" cy="11" r="8" fill="#fbbf24" opacity="0.18"/>
        {/* Pole */}
        <rect x="14" y="18" width="4" height="24" rx="2" fill="white"/>
        {/* Curved arm */}
        <path d="M16 18 Q16 6 26 6" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        {/* Lamp body */}
        <rect x="21" y="3" width="11" height="6" rx="2.5" fill="white"/>
        {/* Amber light lens */}
        <ellipse cx="26.5" cy="10" rx="4" ry="2.2" fill="#fbbf24" opacity="0.95"/>
        {/* Light cone rays */}
        <line x1="22" y1="11" x2="17" y2="20" stroke="#fbbf24" strokeWidth="1.2" opacity="0.45" strokeLinecap="round"/>
        <line x1="26.5" y1="12" x2="26.5" y2="22" stroke="#fbbf24" strokeWidth="1.2" opacity="0.45" strokeLinecap="round"/>
        <line x1="31" y1="11" x2="36" y2="20" stroke="#fbbf24" strokeWidth="1.2" opacity="0.45" strokeLinecap="round"/>
      </svg>

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        <h1 className="font-brand text-xl font-bold leading-tight tracking-tight">
          <span className="text-white">Street</span>
          <span className="text-amber-400">Lights</span>
        </h1>
        <p className="text-slate-400 text-xs leading-tight font-brand">
          Find out what's being built in your neighborhood
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-none">
        <a
          href="https://github.com/Ang-aq/Streetlights"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </a>
        <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap font-brand">
          Hackathon Prototype
        </span>
      </div>

    </header>
  );
}
