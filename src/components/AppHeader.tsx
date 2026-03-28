export default function AppHeader() {
  return (
    <header className="flex-none bg-blue-700 text-white px-4 py-2 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold leading-tight tracking-tight truncate">
          Richmond CIP Explorer
        </h1>
        <p className="text-blue-200 text-xs leading-tight">
          Find infrastructure projects near you
        </p>
      </div>
      <span className="flex-none bg-blue-500 text-blue-100 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-400 whitespace-nowrap">
        Hackathon Prototype
      </span>
    </header>
  );
}
