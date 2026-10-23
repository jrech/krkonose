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

export const illustrationFrame = { width: 1448, height: 1000 };

const mountain = '#365656';
const lowland = '#6c8482';

export const illustrationMarkers: Record<MapPlaceId, IllustrationMarker> = {
  vrchlabi: { x: 600.6, y: 657.4, r: 9.5, fill: '#022f37' },
  'spindleruv-mlyn': { x: 582.2, y: 414.1, r: 7, fill: mountain },
  'pec-pod-snezkou': { x: 804, y: 497.4, r: 7, fill: mountain },
  'janske-lazne': { x: 925.4, y: 637.4, r: 7, fill: mountain },
  jilemnice: { x: 405.3, y: 730.6, r: 7, fill: lowland },
  harrachov: { x: 272.1, y: 286.6, r: 7, fill: mountain },
  trutnov: { x: 1143.1, y: 819.5, r: 7, fill: lowland },
  hostinne: { x: 802, y: 866.8, r: 7, fill: lowland },
};
