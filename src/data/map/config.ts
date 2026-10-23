// Which map the Svozová oblast section shows on tablet/desktop.
// 'image': illustrated raster (src/assets/images/map/krkonose-mapa.png). Labels are baked in, so
//          narrow screens always fall back to the SVG map, whose labels scale.
// 'svg':   data-driven SVG everywhere (CoverageMap.astro), geographically accurate.
export const coverageMapVariant: 'image' | 'svg' = 'image';
