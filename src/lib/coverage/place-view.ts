// Build-time view of a map town: its effective status (src/data/service-area.ts) and the copy for it.
// Both map components render these into data attributes, so the browser never decides a status itself.
import { mapPlaces, type MapPlace } from '../../data/map/places';
import { municipalityStatus, serviceArea, type MunicipalityStatus } from '../../data/service-area';
import { placeCopy } from '../../data/coverage-copy';

export interface PlaceView extends MapPlace { status: MunicipalityStatus; statusLabel: string; accessibleName: string }

/** Towns west to east, which is also the arrow-key and tab order on the map. */
export function getPlaceViews(): PlaceView[] {
  return [...mapPlaces].sort((a, b) => a.lon - b.lon).map(place => {
    const status = municipalityStatus(serviceArea.municipalities[place.id]);
    const statusLabel = placeCopy[status].label;
    return { ...place, status, statusLabel, accessibleName: `${place.name}: ${statusLabel.toLowerCase()}` };
  });
}

export const placeGroupLabel = 'Města na mapě. Výběrem města zobrazíte dostupnost svozu.';
