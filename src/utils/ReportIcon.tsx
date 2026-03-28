import { Lamp, TrafficCone, Construction, Milestone, Footprints, Waves } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReportTypeId } from '../types/report';

const ICON_MAP: Record<ReportTypeId, LucideIcon> = {
  streetlight: Lamp,
  stoplight:   TrafficCone,
  pothole:     Construction,
  unpaved:     Milestone,
  sidewalk:    Footprints,
  flooding:    Waves,
};

interface Props {
  typeId: ReportTypeId;
  color: string;
  size?: number;
}

/** Renders a colored circle with a white lucide icon for the given report type. */
export default function ReportIcon({ typeId, color, size = 36 }: Props) {
  const Icon = ICON_MAP[typeId] ?? Lamp;
  const iconSize = Math.round(size * 0.55);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={iconSize} color="white" strokeWidth={2.5} />
    </div>
  );
}
