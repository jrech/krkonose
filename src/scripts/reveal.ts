// Reveal choreography for [data-reveal] (variants and timing: global.css, tokens.css).
// Progressive enhancement: the head script in BaseLayout adds html.motion only when motion is allowed,
// and drops it again if this file never reports in, so content can't stay hidden.
const root = document.documentElement;
const MAX_ORDER = 5; // caps cumulative stagger at ~450 ms on desktop

function revealBatch(elements: Element[]) {
  // Everything that enters together reveals as one sequence, in reading order.
  elements.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  elements.forEach((element, index) => {
    (element as HTMLElement).style.setProperty('--reveal-order', String(Math.min(index, MAX_ORDER)));
    element.classList.add('is-revealed');
  });
}

function revealAllNow() {
  document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(element => element.classList.add('is-revealed', 'reveal-instant'));
}

if (root.classList.contains('motion')) {
  root.classList.add('motion-live');
  const observer = new IntersectionObserver(entries => {
    // ~15 % of an element in view, or a fifth of the viewport for elements taller than it.
    const batch = entries
      .filter(entry => entry.isIntersecting && (entry.intersectionRatio >= 0.15 || entry.intersectionRect.height >= innerHeight * 0.2))
      .map(entry => entry.target);
    batch.forEach(element => observer.unobserve(element));
    if (batch.length) revealBatch(batch);
  }, { threshold: [0, 0.05, 0.1, 0.15], rootMargin: '0px 0px -5% 0px' });

  document.querySelectorAll('[data-reveal]').forEach(element => {
    // Already scrolled past (reload mid-page, anchor jump): show it without replaying.
    const rect = element.getBoundingClientRect();
    if (rect.height && rect.bottom <= 0) element.classList.add('is-revealed', 'reveal-instant');
    else observer.observe(element);
  });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    revealAllNow();
  });
}
