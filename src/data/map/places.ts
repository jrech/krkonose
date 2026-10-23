// Orientation points shown on the Svozová oblast map. These are town centres for context only:
// a place listed here is NOT a confirmed pickup location. Coverage lives in src/data/service-area.ts.
//
// Coordinates (WGS 84):
// - geonames: GeoNames cities1000 via the cities.json npm package, CC BY 4.0.
// - obce-cr: 33bcdd/souradnice-mest (Czech municipality points, "volně k použití"); used where
//   GeoNames cities1000 has no entry. Cross-checked against Wikipedia, difference under 300 m.

export type LabelSide = 'left' | 'right';

export type MapPlaceId = 'vrchlabi' | 'spindleruv-mlyn' | 'pec-pod-snezkou' | 'janske-lazne' | 'jilemnice' | 'harrachov' | 'trutnov' | 'hostinne';

export interface MapPlace {
  id: MapPlaceId;
  name: string;
  lat: number;
  lon: number;
  source: 'geonames' | 'obce-cr';
  /** Visually emphasised (the laundry's home town). */
  primary?: boolean;
  /** Which side of the marker the name sits on; pick the side with free space. */
  label: LabelSide;
  /** Override for narrow screens, where the map is cropped and labels are larger. */
  compactLabel?: 'below';
}

export const mapPlaces: MapPlace[] = [
  { id: 'vrchlabi', name: 'Vrchlabí', lat: 50.62697, lon: 15.60937, source: 'geonames', primary: true, label: 'right' },
  { id: 'spindleruv-mlyn', name: 'Špindlerův Mlýn', lat: 50.72615, lon: 15.60944, source: 'geonames', label: 'right' },
  { id: 'pec-pod-snezkou', name: 'Pec pod Sněžkou', lat: 50.693981, lon: 15.733267, source: 'obce-cr', label: 'right' },
  { id: 'janske-lazne', name: 'Janské Lázně', lat: 50.631188, lon: 15.781916, source: 'obce-cr', label: 'right' },
  { id: 'jilemnice', name: 'Jilemnice', lat: 50.6089, lon: 15.50653, source: 'geonames', label: 'left', compactLabel: 'below' },
  { id: 'harrachov', name: 'Harrachov', lat: 50.77209, lon: 15.43141, source: 'geonames', label: 'right' },
  { id: 'trutnov', name: 'Trutnov', lat: 50.56101, lon: 15.9127, source: 'geonames', label: 'right' },
  { id: 'hostinne', name: 'Hostinné', lat: 50.54066, lon: 15.72334, source: 'geonames', label: 'right' },
];

export const mapLabels = {
  title: 'Krkonoše a Podkrkonoší',
  // Placed in the Polish part of the frame, north of the border.
  country: { text: 'Polsko', lat: 50.82, lon: 15.83 },
  note: 'Orientační mapa, nikoli hranice svozu.',
  attribution: 'Podklad © ČÚZK, GeoNames, Copernicus EU-DEM, USGS SRTM',
};
