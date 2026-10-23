// Sticky header ([data-site-header], styles in global.css): turns white once the page scrolls, and its
// bar height feeds --header-h so sticky cards and anchor jumps land below it.
const header = document.querySelector<HTMLElement>('[data-site-header]');
if (header) {
  const root = document.documentElement;
  const bar = header.querySelector<HTMLElement>('.header-inner') ?? header;
  const setHeight = () => root.style.setProperty('--header-h', `${Math.round(bar.getBoundingClientRect().height) + 1}px`);
  new ResizeObserver(setHeight).observe(bar);
  setHeight();

  let queued = false;
  const update = () => { queued = false; header.classList.toggle('is-scrolled', scrollY > 8); };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}
