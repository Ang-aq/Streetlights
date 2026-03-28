import { useEffect, useRef, type RefObject } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { Map as LeafletMap } from 'leaflet';
import type { CIPProject } from '../types/project';
import type { Report } from '../types/report';
import { REPORT_TYPES } from '../types/report';
import type { SearchLocation } from '../App';
import { createColoredIcon } from '../utils/markerColors';
import { reportMarkerHtml } from '../utils/reportIcons';
import MapLegend from './MapLegend';

// Richmond, VA center
const RICHMOND_CENTER: [number, number] = [37.5407, -77.4360];
const DEFAULT_ZOOM = 12;

// "You are here" pin — blue pulsing dot
const YOU_ARE_HERE_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width: 18px; height: 18px;
    background: #2563eb;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ─── Cluster layer managed imperatively ───────────────────────────────────────
interface ClusterLayerProps {
  projects: CIPProject[];
  onProjectSelect: (p: CIPProject) => void;
}

function ClusterLayer({ projects, onProjectSelect }: ClusterLayerProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = (L as unknown as Record<string, (...args: unknown[]) => L.MarkerClusterGroup>)
        .markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
        });
      map.addLayer(clusterGroupRef.current);
    }
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    const group = clusterGroupRef.current;
    if (!group) return;

    group.clearLayers();

    projects.forEach(project => {
      const icon = createColoredIcon(project.phase);
      const marker = L.marker([project.lat, project.lng], { icon });

      marker.bindPopup(
        `<div style="min-width:180px">
          <p style="font-weight:600;font-size:13px;margin:0 0 4px">${project.title}</p>
          <p style="font-size:11px;color:#555;margin:0">${project.phase} · ${project.category}</p>
          <p style="font-size:11px;color:#555;margin:4px 0 0">${project.location}</p>
        </div>`,
        { maxWidth: 260 }
      );

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onProjectSelect(project);
      });

      group.addLayer(marker);
    });
  }, [projects, onProjectSelect]);

  return null;
}

// ─── Report markers layer managed imperatively ────────────────────────────────
interface ReportLayerProps {
  reports: Report[];
  likedIds: Set<string>;
  onReportLike: (id: string) => void;
}

// Global callback so popup Like buttons (plain HTML) can call back into React
declare global {
  interface Window {
    __streetlightsLike?: (id: string) => void;
  }
}

function ReportLayer({ reports, likedIds, onReportLike }: ReportLayerProps) {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);

  // Keep the global callback in sync
  useEffect(() => {
    window.__streetlightsLike = onReportLike;
  }, [onReportLike]);

  useEffect(() => {
    // Remove all previous report markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    reports.forEach(report => {
      const typeDef = REPORT_TYPES.find(t => t.id === report.typeId);
      if (!typeDef) return;

      const alreadyLiked = likedIds.has(report.id);
      const icon = L.divIcon({
        className: '',
        html: reportMarkerHtml(report.typeId, typeDef.color, report.likes),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([report.lat, report.lng], { icon });

      const likeBtn = alreadyLiked
        ? `<span style="font-size:11px;color:#6b7280;">Already upvoted</span>`
        : `<button onclick="window.__streetlightsLike && window.__streetlightsLike('${report.id}')"
            style="margin-top:6px;padding:3px 10px;border-radius:999px;border:none;
              background:#2563eb;color:white;font-size:11px;font-weight:600;cursor:pointer;">
            ▲ Upvote
          </button>`;

      marker.bindPopup(
        `<div style="min-width:140px;text-align:center">
          <p style="font-weight:600;font-size:13px;margin:0 0 2px">${typeDef.label}</p>
          <p style="font-size:11px;color:#555;margin:0">${report.likes} upvote${report.likes !== 1 ? 's' : ''}</p>
          ${likeBtn}
        </div>`,
        { maxWidth: 200 }
      );

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];
    };
  }, [reports, likedIds, map]);

  return null;
}

// ─── Map click handler ─────────────────────────────────────────────────────────
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      // Ignore clicks that originated from a marker or popup
      const target = e.originalEvent.target as HTMLElement;
      if (
        target.closest('.leaflet-marker-icon') ||
        target.closest('.leaflet-popup') ||
        target.closest('.leaflet-marker-pane')
      ) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Search location marker ────────────────────────────────────────────────────
function SearchMarker({ searchLocation }: { searchLocation: SearchLocation | null }) {
  if (!searchLocation) return null;
  return (
    <Marker
      position={[searchLocation.lat, searchLocation.lng]}
      icon={YOU_ARE_HERE_ICON}
    />
  );
}

// ─── Map ref setter ────────────────────────────────────────────────────────────
function MapRefSetter({ mapRef }: { mapRef: RefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    (mapRef as { current: LeafletMap | null }).current = map;
    return () => {
      (mapRef as { current: LeafletMap | null }).current = null;
    };
  }, [map, mapRef]);
  return null;
}

// ─── Main MapView ──────────────────────────────────────────────────────────────
interface Props {
  projects: CIPProject[];
  searchLocation: SearchLocation | null;
  onProjectSelect: (p: CIPProject) => void;
  mapRef: RefObject<LeafletMap | null>;
  reports: Report[];
  likedIds: Set<string>;
  onMapClick: (lat: number, lng: number) => void;
  onReportLike: (id: string) => void;
  onOpenPriorityList: () => void;
  bottomPad: number;
}

export default function MapView({
  projects,
  searchLocation,
  onProjectSelect,
  mapRef,
  reports,
  likedIds,
  onMapClick,
  onReportLike,
  onOpenPriorityList,
  bottomPad,
}: Props) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={RICHMOND_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRefSetter mapRef={mapRef} />

        <ClusterLayer
          projects={projects}
          onProjectSelect={onProjectSelect}
        />

        <ReportLayer
          reports={reports}
          likedIds={likedIds}
          onReportLike={onReportLike}
        />

        <MapClickHandler onMapClick={onMapClick} />

        <SearchMarker searchLocation={searchLocation} />
      </MapContainer>

      {/* Legend — bottom-left, above the bottom sheet */}
      <div className="absolute left-2 z-[500] pointer-events-none" style={{ bottom: bottomPad }}>
        <MapLegend />
      </div>

      {/* Report FAB — bottom-right, above the bottom sheet, warning triangle icon only */}
      <button
        onClick={onOpenPriorityList}
        title="View community reports"
        className="absolute right-3 z-[500] p-3 bg-amber-500 hover:bg-amber-400
                   text-white rounded-full shadow-lg active:scale-95 transition-all"
        style={{ bottom: bottomPad }}
      >
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden="true">
          <path
            d="M10 2L2 17h16L10 2z"
            stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"
          />
          <path d="M10 8v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="14.5" r="1.1" fill="white" />
        </svg>
      </button>
    </div>
  );
}
