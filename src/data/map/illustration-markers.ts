// Where the city markers sit in the illustrated raster map (src/assets/images/map/krkonose-mapa.png),
// in image pixels. Measured from the PNG (centroid of each dot, ±1 px). The illustration is not
// georeferenced, so these deliberately do NOT come from the GPS points in places.ts.
// Replace this file together with the image if the illustration ever changes.
import type { MapPlaceId } from './places';

export interface IllustrationMarker {
  x: number;
  y: number;
  /** Radius of the baked-in dot and its fill, so the interactive copy lines up with it exactly. */
  r: number;
  fill: string;
}

export const illustrationFrame = { width: 1663, height: 945 };

const mountain = '#163c4a';
const lowland = '#3c5a5f';

export const illustrationMarkers: Record<MapPlaceId, IllustrationMarker> = {
  vrchlabi: { x: 644.9, y: 633.5, r: 9, fill: mountain },
  'spindleruv-mlyn': { x: 625.4, y: 386.3, r: 9, fill: mountain },
  'pec-pod-snezkou': { x: 861, y: 475.4, r: 9, fill: mountain },
  'janske-lazne': { x: 992.3, y: 614.3, r: 9, fill: mountain },
  harrachov: { x: 297.5, y: 262.4, r: 9, fill: mountain },
  'rokytnice-nad-jizerou': { x: 197.6, y: 583, r: 9, fill: mountain },
  jilemnice: { x: 433.8, y: 708.4, r: 9, fill: lowland },
  trutnov: { x: 1224.8, y: 800.4, r: 9, fill: lowland },
  hostinne: { x: 860, y: 845.3, r: 9, fill: lowland },
};
