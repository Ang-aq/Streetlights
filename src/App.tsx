import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { projects } from './data';
import type { CIPProject, ProjectCategory } from './types/project';
import type { Report } from './types/report';
import { haversineDistance } from './utils/geo';
import { useReports } from './hooks/useReports';
import TopBar from './components/TopBar';
import MapView from './components/Map';
import MapLegend from './components/MapLegend';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import ReportModal from './components/ReportModal';
import ReportIntentPrompt from './components/ReportIntentPrompt';
import PriorityList from './components/PriorityList';

export interface SearchLocation {
  lat: number;
  lng: number;
  displayName: string;
}

// ─── Reporting state machine ───────────────────────────────────────────────────
type ReportingStep =
  | { kind: 'idle' }
  | { kind: 'intent' }
  | { kind: 'pickingLocation' }
  | { kind: 'pickingType'; lat: number; lng: number };

const IDLE: ReportingStep = { kind: 'idle' };

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

const RADIUS_OPTIONS = [0.25, 0.5, 1, 2, 5] as const;
const DEFAULT_RADIUS = 1;

// Height of the bottom sheet in peek state
const PEEK_HEIGHT = 260;
// Height of the bottom sheet in collapsed state (handle bar only)
const COLLAPSED_HEIGHT = 44;

export default function App() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [radiusMiles, setRadiusMiles] = useState<number>(DEFAULT_RADIUS);
  const [selectedProject, setSelectedProject] = useState<CIPProject | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<ProjectCategory>>(new Set());
  const [sheetSnap, setSheetSnap] = useState<'collapsed' | 'peek'>('peek');
  const isDesktop = useIsDesktop();

  // Reporting state machine
  const { reports, priorityReports, likedIds, addReport, likeReport } = useReports();
  const [reportingStep, setReportingStep] = useState<ReportingStep>(IDLE);
  const [showPriorityList, setShowPriorityList] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Collapse the sheet on mobile when the info modal opens; restore when it closes
  useEffect(() => {
    if (!isDesktop) {
      setSheetSnap(showInfo ? 'collapsed' : 'peek');
    }
  }, [showInfo, isDesktop]);

  // Category-filtered project list
  const categoryFiltered = useMemo(() => {
    if (activeCategories.size === 0) return projects;
    return projects.filter(p => activeCategories.has(p.category));
  }, [activeCategories]);

  // Proximity-filtered + sorted list
  const nearbyProjects = useMemo(() => {
    if (!searchLocation) return categoryFiltered;
    return categoryFiltered
      .map(p => ({
        ...p,
        distanceFromSearch: haversineDistance(searchLocation.lat, searchLocation.lng, p.lat, p.lng),
      }))
      .filter(p => (p.distanceFromSearch ?? Infinity) <= radiusMiles)
      .sort((a, b) => (a.distanceFromSearch ?? 0) - (b.distanceFromSearch ?? 0));
  }, [searchLocation, radiusMiles, categoryFiltered]);

  const handleSearch = useCallback((loc: SearchLocation) => {
    setSearchLocation(loc);
    setSelectedProject(null);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchLocation(null);
    setSelectedProject(null);
    setSheetSnap('peek');
  }, []);

  const handleProjectSelect = useCallback((project: CIPProject) => {
    setSelectedProject(project);
    setSheetSnap('peek');
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.flyTo([project.lat, project.lng], Math.max(currentZoom, 15), { duration: 0.8 });
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedProject(null);
    setSheetSnap('peek');
  }, []);

  const handleCategoryToggle = useCallback((category: ProjectCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleClearCategories = useCallback(() => {
    setActiveCategories(new Set());
  }, []);

  // Step 1 → 2: user confirmed intent, now picking location
  const handleStartReport = useCallback(() => {
    setReportingStep({ kind: 'intent' });
  }, []);

  const handleIntentConfirm = useCallback(() => {
    setReportingStep({ kind: 'pickingLocation' });
  }, []);

  const handleReportCancel = useCallback(() => {
    setReportingStep(IDLE);
  }, []);

  // Step 2 → 3: map tapped while picking location
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setReportingStep(prev => {
      if (prev.kind === 'pickingLocation') {
        return { kind: 'pickingType', lat, lng };
      }
      return prev;
    });
  }, []);

  // Step 3 → idle: report submitted
  const handleReportSubmit = useCallback((typeId: import('./types/report').ReportTypeId) => {
    setReportingStep(prev => {
      if (prev.kind === 'pickingType') {
        addReport(typeId, prev.lat, prev.lng);
      }
      return IDLE;
    });
  }, [addReport]);

  const handleLocateReport = useCallback((report: Report) => {
    setShowPriorityList(false);
    if (mapRef.current) {
      mapRef.current.flyTo([report.lat, report.lng], 17, { duration: 0.8 });
    }
  }, []);

  const displayProjects = searchLocation ? nearbyProjects : categoryFiltered;

  // Sheet handle label
  const sheetLabel = selectedProject
    ? selectedProject.title
    : searchLocation
      ? `${displayProjects.length} nearby project${displayProjects.length !== 1 ? 's' : ''}`
      : `${displayProjects.length} projects`;

  const isPickingLocation = reportingStep.kind === 'pickingLocation';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50" style={{ height: '100svh' }}>
      <TopBar
        searchLocation={searchLocation}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        mapRef={mapRef}
        radiusMiles={radiusMiles}
        radiusOptions={[...RADIUS_OPTIONS]}
        onRadiusChange={setRadiusMiles}
        nearbyCount={searchLocation ? nearbyProjects.length : null}
        showInfo={showInfo}
        onShowInfo={setShowInfo}
      />



      {/* Picking-location banner — shown across the top of the map */}
      {isPickingLocation && (
        <div className="flex-none flex items-center justify-between px-4 py-2 bg-amber-500 text-white text-sm font-medium z-[600]">
          <span>Tap the map to place your report pin</span>
          <button
            onClick={handleReportCancel}
            className="ml-3 text-white/80 hover:text-white underline text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Content area — responsive layout */}
      {isDesktop ? (
        /* Desktop: map + side panel side by side */
        <div className="flex flex-row flex-1 overflow-hidden">
          {/* Map fills remaining width */}
          <div className="flex-1 relative">
            <MapView
              projects={displayProjects}
              selectedProjectId={selectedProject?.id ?? null}
              searchLocation={searchLocation}
              onProjectSelect={handleProjectSelect}
              mapRef={mapRef}
              reports={reports}
              likedIds={likedIds}
              onMapClick={handleMapClick}
              onReportLike={likeReport}
              onStartReport={handleStartReport}
              bottomPad={24}
              pickingLocation={isPickingLocation}
            />
          </div>

          {/* Side panel */}
          <div className="flex-none w-80 h-full border-l border-gray-200 bg-white flex flex-col overflow-hidden">
            {selectedProject ? (
              <>
                <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-slate-700">Project detail</span>
                  <button
                    onClick={handleCloseDetail}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close detail"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ProjectDetail project={selectedProject} onClose={handleCloseDetail} inline />
                </div>
              </>
            ) : (
              <ProjectList
                projects={displayProjects}
                allProjects={projects}
                selectedProject={null}
                searchActive={!!searchLocation}
                activeCategories={activeCategories}
                onToggleCategory={handleCategoryToggle}
                onClearCategories={handleClearCategories}
                onSelect={handleProjectSelect}
              />
            )}
          </div>
        </div>
      ) : (
        /* Mobile: map full size, bottom sheet overlay */
        <div className="flex-1 relative overflow-hidden">

          {/* Map — always full size */}
          <div className="absolute inset-0">
            <MapView
              projects={displayProjects}
              selectedProjectId={selectedProject?.id ?? null}
              searchLocation={searchLocation}
              onProjectSelect={handleProjectSelect}
              mapRef={mapRef}
              reports={reports}
              likedIds={likedIds}
              onMapClick={handleMapClick}
              onReportLike={likeReport}
              onStartReport={handleStartReport}
              bottomPad={24}
              hideMapControls
              pickingLocation={isPickingLocation}
            />
          </div>

          {/* Mobile controls bar — transparent overlay, top-right of map */}
          <div className="absolute top-2 right-2 z-[500] flex items-center gap-2">
            {/* Amber circle: starts the new report flow */}
            <button
              onClick={handleStartReport}
              title="Report an infrastructure issue"
              className="p-2 bg-amber-500 hover:bg-amber-400 text-white rounded-full shadow-lg active:scale-95 transition-all"
            >
              <svg width="16" height="14" viewBox="0 0 20 18" fill="none" aria-hidden="true">
                <path d="M10 2L2 17h16L10 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
                <path d="M10 8v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="10" cy="14.5" r="1.1" fill="white" />
              </svg>
            </button>
            {/* Community Reports link */}
            <button
              onClick={() => setShowPriorityList(true)}
              className="text-xs font-medium text-amber-700 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow whitespace-nowrap hover:bg-white transition-colors"
            >
              Reports ({reports.length})
            </button>
            <MapLegend dropdown />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[400] flex flex-col overflow-hidden"
            style={{
              height: sheetSnap === 'collapsed' ? COLLAPSED_HEIGHT : PEEK_HEIGHT,
              transition: 'height 250ms ease',
            }}
          >
            {/* Handle bar — tap to toggle collapsed ↔ peek */}
            <div
              className="flex-none flex items-center justify-between px-4 cursor-pointer select-none border-b border-gray-100"
              style={{ minHeight: COLLAPSED_HEIGHT }}
              onClick={() => setSheetSnap(v => v === 'collapsed' ? 'peek' : 'collapsed')}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-1 rounded-full bg-gray-300 flex-none" />
                <span className="text-xs font-medium text-gray-500 truncate">
                  {sheetLabel}
                </span>
              </div>
              {/* Chevron: ∧ when collapsed (tap to open), ∨ when peeking (tap to close) */}
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className={`flex-none text-gray-400 transition-transform duration-200 ${sheetSnap === 'collapsed' ? 'rotate-180' : ''}`}
              >
                <path d="M2 5l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Sheet content — scrollable project list or detail */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
            >
              {selectedProject ? (
                <ProjectDetail
                  project={selectedProject}
                  onClose={handleCloseDetail}
                  inline
                />
              ) : (
                <ProjectList
                  projects={displayProjects}
                  allProjects={projects}
                  selectedProject={null}
                  searchActive={!!searchLocation}
                  activeCategories={activeCategories}
                  onToggleCategory={handleCategoryToggle}
                  onClearCategories={handleClearCategories}
                  onSelect={handleProjectSelect}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: intent prompt */}
      {reportingStep.kind === 'intent' && (
        <ReportIntentPrompt
          onConfirm={handleIntentConfirm}
          onCancel={handleReportCancel}
        />
      )}

      {/* Step 3: type picker modal */}
      {reportingStep.kind === 'pickingType' && (
        <ReportModal
          lat={reportingStep.lat}
          lng={reportingStep.lng}
          onSubmit={handleReportSubmit}
          onCancel={handleReportCancel}
        />
      )}

      {/* Priority list panel */}
      {showPriorityList && (
        <PriorityList
          reports={priorityReports}
          likedIds={likedIds}
          onLike={likeReport}
          onLocate={handleLocateReport}
          onClose={() => setShowPriorityList(false)}
        />
      )}
    </div>
  );
}
