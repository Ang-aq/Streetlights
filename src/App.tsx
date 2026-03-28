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

export default function App() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [radiusMiles, setRadiusMiles] = useState<number>(DEFAULT_RADIUS);
  const [selectedProject, setSelectedProject] = useState<CIPProject | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<ProjectCategory>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setSidebarOpen(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchLocation(null);
    setSelectedProject(null);
    setSidebarOpen(false);
  }, []);

  const handleProjectSelect = useCallback((project: CIPProject) => {
    setSelectedProject(project);
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.flyTo([project.lat, project.lng], Math.max(currentZoom, 15), { duration: 0.8 });
    }
  }, []);

  const handleCategoryToggle = useCallback((category: ProjectCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
        setSidebarOpen(true);
      }
      return next;
    });
  }, []);

  const handleClearCategories = useCallback(() => {
    setActiveCategories(new Set());
  }, []);

  // Map click → open ReportModal
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setReportClickPos({ lat, lng });
  }, []);

  // ReportModal submit
  const handleReportSubmit = useCallback((typeId: import('./types/report').ReportTypeId) => {
    if (!reportClickPos) return;
    addReport(typeId, reportClickPos.lat, reportClickPos.lng);
    setReportClickPos(null);
  }, [reportClickPos, addReport]);

  // PriorityList "View on map"
  const handleLocateReport = useCallback((report: Report) => {
    setShowPriorityList(false);
    if (mapRef.current) {
      mapRef.current.flyTo([report.lat, report.lng], 17, { duration: 0.8 });
    }
  }, []);

  const displayProjects = searchLocation ? nearbyProjects : categoryFiltered;

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
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
      />

      {/* Main content area — map fills full width, sidebar slides in */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Map — always full width */}
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
          />
        </div>

        {/* Sidebar — slides in from right over the map */}
        <div
          className="absolute top-0 right-0 bottom-0 overflow-hidden bg-white shadow-xl z-[400]"
          style={{
            width: sidebarOpen ? 320 : 0,
            transition: 'width 200ms ease',
          }}
        >
          <div style={{ width: 320 }} className="h-full overflow-y-auto">
            <ProjectList
              projects={displayProjects}
              selectedProject={selectedProject}
              searchActive={!!searchLocation}
              onSelect={handleProjectSelect}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Project detail overlay */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
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
