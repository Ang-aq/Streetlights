import { useState, useCallback, useMemo, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { projects } from './data';
import type { CIPProject, ProjectCategory } from './types/project';
import type { Report } from './types/report';
import { haversineDistance } from './utils/geo';
import { useReports } from './hooks/useReports';
import AppHeader from './components/AppHeader';
import PrototypeBanner from './components/PrototypeBanner';
import MapView from './components/Map';
import SearchBar from './components/SearchBar';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import CategoryFilter from './components/CategoryFilter';
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
      <PrototypeBanner />
      <AppHeader />

      {/* Search + Filter bar */}
      <div className="flex-none bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="px-3 pt-2 pb-1">
          <SearchBar
            onSearch={handleSearch}
            mapRef={mapRef}
            searchLocation={searchLocation}
            radiusMiles={radiusMiles}
            onRadiusChange={setRadiusMiles}
            radiusOptions={[...RADIUS_OPTIONS]}
            nearbyCount={searchLocation ? nearbyProjects.length : null}
          />
        </div>
        <div className="px-3 pb-2">
          <CategoryFilter
            projects={projects}
            activeCategories={activeCategories}
            onToggle={handleCategoryToggle}
            onClear={handleClearCategories}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Map */}
        <div className="flex-1 md:flex-[3] relative min-h-[40vh]">
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

        {/* Sidebar */}
        <div className="flex-none md:flex-[2] md:max-w-sm w-full overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200 bg-white">
          <ProjectList
            projects={displayProjects}
            selectedProject={selectedProject}
            searchActive={!!searchLocation}
            onSelect={handleProjectSelect}
          />
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
