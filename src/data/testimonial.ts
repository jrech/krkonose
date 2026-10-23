// Placeholder quote from the Refresh 02 design (krkonose.pen). The spec forbids invented references,
// so the section stays out of the production build until the owner supplies a real, approved quote.
// Then replace the text and role below and set `verified: true`.
export const testimonial = {
  verified: false,
  quote: 'Nejvíc oceňujeme, že se můžeme domluvit podle toho, jak se u nás střídají hosté. Prádlo se vrací připravené a my máme o starost méně.',
  role: 'Provozovatelka rodinného penzionu',
  place: 'Krkonoše',
};

// Visible in `astro dev` for design review; in the build only once verified.
export const showTestimonial = testimonial.verified || import.meta.env.DEV;
