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
import PriorityList from './components/PriorityList';

export interface SearchLocation {
  lat: number;
  lng: number;
  displayName: string;
}

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

  // Reporting state
  const { reports, priorityReports, likedIds, addReport, likeReport } = useReports();
  const [reportClickPos, setReportClickPos] = useState<{ lat: number; lng: number } | null>(null);
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

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setReportClickPos({ lat, lng });
  }, []);

  const handleReportSubmit = useCallback((typeId: import('./types/report').ReportTypeId) => {
    if (!reportClickPos) return;
    addReport(typeId, reportClickPos.lat, reportClickPos.lng);
    setReportClickPos(null);
  }, [reportClickPos, addReport]);

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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <TopBar
        searchLocation={searchLocation}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        mapRef={mapRef}
        allProjects={projects}
        activeCategories={activeCategories}
        onToggleCategory={handleCategoryToggle}
        onClearCategories={handleClearCategories}
        radiusMiles={radiusMiles}
        radiusOptions={[...RADIUS_OPTIONS]}
        onRadiusChange={setRadiusMiles}
        nearbyCount={searchLocation ? nearbyProjects.length : null}
        showInfo={showInfo}
        onShowInfo={setShowInfo}
      />

      {/* Content area — responsive layout */}
      {isDesktop ? (
        /* Desktop: map + side panel side by side */
        <div className="flex flex-row flex-1 overflow-hidden">
          {/* Map fills remaining width */}
          <div className="flex-1 relative">
            <MapView
              projects={displayProjects}
              searchLocation={searchLocation}
              onProjectSelect={handleProjectSelect}
              mapRef={mapRef}
              reports={reports}
              likedIds={likedIds}
              onMapClick={handleMapClick}
              onReportLike={likeReport}
              onOpenPriorityList={() => setShowPriorityList(true)}
              bottomPad={24}
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
                selectedProject={null}
                searchActive={!!searchLocation}
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
              searchLocation={searchLocation}
              onProjectSelect={handleProjectSelect}
              mapRef={mapRef}
              reports={reports}
              likedIds={likedIds}
              onMapClick={handleMapClick}
              onReportLike={likeReport}
              onOpenPriorityList={() => setShowPriorityList(true)}
              bottomPad={24}
              hideMapControls
            />
          </div>

          {/* Bottom sheet — 2 states: collapsed (handle only) or peek */}
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

            {/* Action row — MapLegend + circular Reports FAB, above the list */}
            {!selectedProject && (
              <div className="flex-none flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                <MapLegend />
                <button
                  onClick={() => setShowPriorityList(true)}
                  title="View community reports"
                  className="flex-none p-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-full shadow active:scale-95 transition-all"
                >
                  <svg width="16" height="14" viewBox="0 0 20 18" fill="none" aria-hidden="true">
                    <path d="M10 2L2 17h16L10 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
                    <path d="M10 8v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="10" cy="14.5" r="1.1" fill="white" />
                  </svg>
                </button>
              </div>
            )}

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
                  selectedProject={null}
                  searchActive={!!searchLocation}
                  onSelect={handleProjectSelect}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {reportClickPos && (
        <ReportModal
          lat={reportClickPos.lat}
          lng={reportClickPos.lng}
          onSubmit={handleReportSubmit}
          onCancel={() => setReportClickPos(null)}
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
