import { reportIconPaths } from './reportIcons';
import type { ReportTypeId } from '../types/report';

interface Props {
  typeId: ReportTypeId;
  color: string;
  size?: number;
}

/** Renders a colored circle with a white SVG icon for the given report type. */
export default function ReportIcon({ typeId, color, size = 36 }: Props) {
  const svgSize = Math.round(size * 0.55);

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
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        dangerouslySetInnerHTML={{ __html: reportIconPaths(typeId) }}
      />
    </div>
  );
}
