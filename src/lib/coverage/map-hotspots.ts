// Interactive towns on the Svozová oblast maps (illustration overlay and the mobile SVG map).
// Markup contract, rendered at build time from src/data/service-area.ts:
//   [data-coverage-map]                 figure; one per map, both can be on the page
//     [data-place="id"]                 focusable SVG <g role="button"> with data-name, data-status, data-status-label
//       [data-anchor]                   the dot the tooltip points at
//     [data-map-tooltip]                HTML tooltip with [data-tooltip-name] and [data-tooltip-status]
// Picking a town dispatches `coverage-place-select` on document; the address form listens and answers.
// Typing a new address dispatches `coverage-place-clear`, which drops the selection on every map.
import type { MunicipalityStatus } from '../../data/service-area';

export interface PlaceSelectDetail { id: string; name: string; status: MunicipalityStatus }

export const PLACE_SELECT = 'coverage-place-select';
export const PLACE_CLEAR = 'coverage-place-clear';
const TOOLTIP_GAP = 14;

export function initMapHotspots(root: HTMLElement) {
  const places = [...root.querySelectorAll<SVGGElement>('[data-place]')];
  const tooltip = root.querySelector<HTMLElement>('[data-map-tooltip]');
  if (!places.length || !tooltip) return;
  const tooltipName = tooltip.querySelector<HTMLElement>('[data-tooltip-name]')!;
  const tooltipStatus = tooltip.querySelector<HTMLElement>('[data-tooltip-status]')!;

  let shown: SVGGElement | null = null;
  // A tap has no hover, so the tapped town keeps its tooltip until the next tap elsewhere.
  let pinned = false;
  let lastPointer = 'mouse';

  function showTooltip(place: SVGGElement) {
    shown = place;
    tooltipName.textContent = place.dataset.name ?? '';
    tooltipStatus.textContent = place.dataset.statusLabel ?? '';
    tooltip!.dataset.status = place.dataset.status;
    const anchor = (place.querySelector('[data-anchor]') ?? place).getBoundingClientRect();
    const box = root.getBoundingClientRect();
    const x = anchor.left + anchor.width / 2 - box.left;
    const y = anchor.top + anchor.height / 2 - box.top;
    // Keep it inside the figure (it clips): flip below near the top, clamp at the sides.
    const { offsetWidth: w, offsetHeight: h } = tooltip!;
    const below = y - anchor.height / 2 - TOOLTIP_GAP - h < 8;
    tooltip!.classList.toggle('is-below', below);
    tooltip!.style.left = `${Math.min(Math.max(x, w / 2 + 8), box.width - w / 2 - 8)}px`;
    tooltip!.style.top = `${below ? y + anchor.height / 2 + TOOLTIP_GAP : y - anchor.height / 2 - TOOLTIP_GAP}px`;
    tooltip!.classList.add('is-visible');
  }

  function hideTooltip(place?: SVGGElement) {
    if (place && place !== shown) return;
    shown = null;
    pinned = false;
    tooltip!.classList.remove('is-visible');
  }

  function select(place: SVGGElement) {
    const detail: PlaceSelectDetail = { id: place.dataset.place!, name: place.dataset.name!, status: place.dataset.status as MunicipalityStatus };
    document.dispatchEvent(new CustomEvent<PlaceSelectDetail>(PLACE_SELECT, { detail }));
  }

  function markSelected(id: string | null) {
    places.forEach(place => {
      const selected = place.dataset.place === id;
      place.classList.toggle('is-selected', selected);
      place.setAttribute('aria-pressed', String(selected));
    });
  }


  places.forEach((place, index) => {
    place.addEventListener('pointerdown', event => { lastPointer = event.pointerType; });
    place.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') showTooltip(place); });
    place.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse' && !pinned) hideTooltip(place); });
    place.addEventListener('focus', () => { if (place.matches(':focus-visible')) showTooltip(place); });
    place.addEventListener('blur', () => { if (!pinned) hideTooltip(place); });
    place.addEventListener('click', () => {
      select(place);
      if (lastPointer !== 'mouse') { showTooltip(place); pinned = true; }
      lastPointer = 'mouse';
    });
    place.addEventListener('keydown', event => {
      const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select(place);
        showTooltip(place);
      } else if (event.key === 'Escape') {
        hideTooltip();
      } else if (step) {
        event.preventDefault();
        places[(index + step + places.length) % places.length].focus();
      }
    });
  });

  document.addEventListener('pointerdown', event => { if (pinned && !root.contains(event.target as Node)) hideTooltip(); });
  document.addEventListener(PLACE_SELECT, event => markSelected((event as CustomEvent<PlaceSelectDetail>).detail.id));
  document.addEventListener(PLACE_CLEAR, () => { markSelected(null); hideTooltip(); });
  // The tooltip is positioned in px; a resize would leave it off its marker.
  addEventListener('resize', () => hideTooltip());
}
