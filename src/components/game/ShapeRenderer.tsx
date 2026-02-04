interface ShapeRendererProps {
  shape: string;
  color: string;
  size?: number;
}

export function ShapeRenderer({ shape, color, size = 60 }: ShapeRendererProps) {
  const half = size / 2;

  const shapes: Record<string, JSX.Element> = {
    circle: (
      <circle cx={half} cy={half} r={half * 0.8} fill={color} />
    ),
    square: (
      <rect
        x={size * 0.1}
        y={size * 0.1}
        width={size * 0.8}
        height={size * 0.8}
        fill={color}
      />
    ),
    triangle: (
      <polygon
        points={`${half},${size * 0.1} ${size * 0.9},${size * 0.9} ${size * 0.1},${size * 0.9}`}
        fill={color}
      />
    ),
    diamond: (
      <polygon
        points={`${half},${size * 0.05} ${size * 0.95},${half} ${half},${size * 0.95} ${size * 0.05},${half}`}
        fill={color}
      />
    ),
    star: (
      <polygon
        points={starPoints(half, half, half * 0.85, half * 0.4, 5)}
        fill={color}
      />
    ),
    hexagon: (
      <polygon
        points={polygonPoints(half, half, half * 0.85, 6)}
        fill={color}
      />
    ),
    cross: (
      <path
        d={`M${size * 0.35},${size * 0.1} h${size * 0.3} v${size * 0.25} h${size * 0.25} v${size * 0.3} h-${size * 0.25} v${size * 0.25} h-${size * 0.3} v-${size * 0.25} h-${size * 0.25} v-${size * 0.3} h${size * 0.25}z`}
        fill={color}
      />
    ),
    pentagon: (
      <polygon
        points={polygonPoints(half, half, half * 0.85, 5, -Math.PI / 2)}
        fill={color}
      />
    ),
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {shapes[shape] || shapes.circle}
    </svg>
  );
}

function polygonPoints(cx: number, cy: number, r: number, sides: number, startAngle = 0): string {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (2 * Math.PI * i) / sides;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(' ');
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const result: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = -Math.PI / 2 + (Math.PI * i) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    result.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return result.join(' ');
}
