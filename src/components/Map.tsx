import { useEffect, useRef, type RefObject } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { Map as LeafletMap } from 'leaflet';
import type { CIPProject } from '../types/project';
import type { SearchLocation } from '../App';
import { createColoredIcon } from '../utils/markerColors';
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
  selectedProject: CIPProject | null;
  onProjectSelect: (p: CIPProject) => void;
}

function ClusterLayer({ projects, selectedProject, onProjectSelect }: ClusterLayerProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // Create cluster group once
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

      marker.on('click', () => {
        onProjectSelect(project);
      });

      group.addLayer(marker);
    });
  }, [projects, onProjectSelect]);

  // Highlight selected marker (optional visual feedback — bring it to front)
  useEffect(() => {
    if (!selectedProject) return;
    // flyTo is handled by App.tsx via mapRef; nothing extra needed here
  }, [selectedProject]);

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

// ─── Main MapView ──────────────────────────────────────────────────────────────
interface Props {
  projects: CIPProject[];
  selectedProject: CIPProject | null;
  searchLocation: SearchLocation | null;
  onProjectSelect: (p: CIPProject) => void;
  mapRef: RefObject<LeafletMap | null>;
}

// Inner component that has access to the map instance
function MapRefSetter({ mapRef }: { mapRef: RefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    (mapRef as React.MutableRefObject<LeafletMap | null>).current = map;
    return () => {
      (mapRef as React.MutableRefObject<LeafletMap | null>).current = null;
    };
  }, [map, mapRef]);
  return null;
}

export default function MapView({
  projects,
  selectedProject,
  searchLocation,
  onProjectSelect,
  mapRef,
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
          selectedProject={selectedProject}
          onProjectSelect={onProjectSelect}
        />

        <SearchMarker searchLocation={searchLocation} />
      </MapContainer>

      {/* Legend — positioned bottom-left inside the map div */}
      <div className="absolute bottom-6 left-2 z-[500] pointer-events-none">
        <MapLegend />
      </div>
    </div>
  );
}
