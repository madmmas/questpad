import { getStroke } from "perfect-freehand";

export type StrokePoint = {
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
};

export type Stroke = {
  points: StrokePoint[];
  color: string;
  size: number;
};

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 340;
export const CANVAS_BACKGROUND = "#f6f3ea";

const STROKE_OPTIONS = {
  thinning: 0.6,
  smoothing: 0.5,
  streamline: 0.5,
} as const;

function svgPathFromOutline(outline: number[][]): string {
  if (outline.length === 0) return "";

  const [firstX, firstY] = outline[0];
  const parts: (string | number)[] = ["M", firstX, firstY, "Q"];

  outline.forEach(([x0, y0], index) => {
    const [x1, y1] = outline[(index + 1) % outline.length];
    parts.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  });

  parts.push("Z");
  return parts.join(" ");
}

export function strokeOutlinePath(stroke: Stroke): string {
  if (stroke.points.length === 0) return "";

  const outline = getStroke(
    stroke.points.map((point) => [point.x, point.y, point.pressure]),
    { ...STROKE_OPTIONS, size: stroke.size },
  );

  return svgPathFromOutline(outline);
}

export function renderScratchpadSvg(strokes: Stroke[]): string {
  const paths = strokes
    .map((stroke) => {
      const d = strokeOutlinePath(stroke);
      return d ? `<path d="${d}" fill="${stroke.color}" />` : "";
    })
    .filter((path) => path.length > 0)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}"><rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="${CANVAS_BACKGROUND}" />${paths}</svg>`;
}
