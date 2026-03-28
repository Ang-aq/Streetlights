import { useState, useCallback, useMemo, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { projects } from './data';
import type { CIPProject, ProjectCategory } from './types/project';
import type { Report } from './types/report';
import { haversineDistance } from './utils/geo';
import { useReports } from './hooks/useReports';
import TopBar from './components/TopBar';
import MapView from './components/Map';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import ReportModal from './components/ReportModal';
import PriorityList from './components/PriorityList';

export interface SearchLocation {
  lat: number;
  lng: number;
  displayName: string;
}

const RADIUS_OPTIONS = [0.25, 0.5, 1, 2, 5] as const;
const DEFAULT_RADIUS = 1;

// Height of the bottom sheet in peek (collapsed) state
const PEEK_HEIGHT = 260;
// Offset for map controls so they sit above the peek sheet
const MAP_BOTTOM_PAD = PEEK_HEIGHT + 8;

export default function App() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [radiusMiles, setRadiusMiles] = useState<number>(DEFAULT_RADIUS);
  const [selectedProject, setSelectedProject] = useState<CIPProject | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<ProjectCategory>>(new Set());
  const [sheetSnap, setSheetSnap] = useState<'peek' | 'full'>('peek');

  // Reporting state
  const { reports, priorityReports, likedIds, addReport, likeReport } = useReports();
  const [reportClickPos, setReportClickPos] = useState<{ lat: number; lng: number } | null>(null);
  const [showPriorityList, setShowPriorityList] = useState(false);

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
    setSheetSnap('full');
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
      />

      {/* Content area — map fills full space, sheet overlays from bottom */}
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
            bottomPad={MAP_BOTTOM_PAD}
          />
        </div>

        {/* Bottom sheet — slides up from bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[400] flex flex-col"
          style={{
            height: sheetSnap === 'full' ? '65vh' : PEEK_HEIGHT,
            transition: 'height 250ms ease',
          }}
        >
          {/* Handle bar — tap to toggle peek ↔ full */}
          <div
            className="flex-none flex items-center justify-between px-4 py-2.5 cursor-pointer select-none border-b border-gray-100"
            onClick={() => setSheetSnap(v => v === 'full' ? 'peek' : 'full')}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-1 rounded-full bg-gray-300 flex-none" />
              <span className="text-xs font-medium text-gray-500 truncate">
                {sheetLabel}
              </span>
            </div>
            {/* Chevron — points up when full, down when peek */}
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`flex-none text-gray-400 transition-transform duration-200 ${sheetSnap === 'full' ? 'rotate-180' : ''}`}
            >
              <path d="M2 5l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Sheet content — scrollable */}
          <div className="flex-1 overflow-y-auto">
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
