// Separator rules draw from the left as they scroll into view (styles and timing: "Rule draw" in
// global.css, tokens.css). Which lines take part is listed once in RULES below and mirrored there.
// Like reveal.ts this only runs under html.motion, whose head-script failsafe brings the plain borders
// back if this bundle never reports in.
const RULES = { top: '[data-rule="top"], .prose section + section, .prose dl', bottom: '[data-rule="bottom"], .prose dl > div' };
const BATCH = 4; // rules entering together stagger in groups of four, so a long list doesn't trail
const html = document.documentElement;
const edges = new Map<Element, 'top' | 'bottom'>();
for (const [edge, selector] of Object.entries(RULES) as ['top' | 'bottom', string][]) {
  document.querySelectorAll(selector).forEach(rule => edges.set(rule, edge));
}

function drawBatch(rules: Element[], delay = 0) {
  rules.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  rules.forEach((rule, index) => {
    const style = (rule as HTMLElement).style;
    style.setProperty('--rule-order', String(index % BATCH));
    if (delay) style.setProperty('--rule-delay', `${delay}ms`);
    rule.classList.add('is-drawn');
  });
}

// A rule inside a block that reveal.ts has not shown yet (FAQ list, legal prose, contact column) would
// draw unseen; it waits for that block and starts 120 ms into its rise, like the Process rules.
function draw(rules: Element[]) {
  const waiting = new Map<Element, Element[]>();
  const ready = rules.filter(rule => {
    const host = rule.closest('[data-reveal]:not(.is-revealed)');
    if (host) waiting.set(host, [...(waiting.get(host) ?? []), rule]);
    return !host;
  });
  if (ready.length) drawBatch(ready);
  waiting.forEach((hostRules, host) => {
    const observer = new MutationObserver(() => {
      if (!host.classList.contains('is-revealed')) return;
      observer.disconnect();
      // The CSS minifier may write the token as 90ms or .09s.
      const token = getComputedStyle(html).getPropertyValue('--motion-stagger').trim();
      const step = (token.endsWith('ms') ? parseFloat(token) : parseFloat(token) * 1000) || 90;
      drawBatch(hostRules, Number((host as HTMLElement).style.getPropertyValue('--reveal-order')) * step + 120);
    });
    observer.observe(host, { attributeFilter: ['class'] });
  });
}

if (html.classList.contains('motion') && edges.size) {
  // The line itself must reach 90 % of the viewport; a rule that is fully in view counts too, so the
  // last rows of the page (footer) still draw on screens taller than the scroll can bring them up. The root
  // reaches far above the viewport, so a rule skipped past between frames still reports in and gets drawn.
  const observer = new IntersectionObserver(entries => {
    const batch = entries
      .filter(entry => entry.isIntersecting && (entry.boundingClientRect[edges.get(entry.target)!] <= innerHeight * 0.9 || entry.intersectionRatio === 1))
      .map(entry => entry.target);
    batch.forEach(rule => {
      observer.unobserve(rule);
      // Carried past the viewport between frames (fast scroll, anchor jump): show it as is.
      if (rule.getBoundingClientRect()[edges.get(rule)!] <= 0) rule.classList.add('rule-instant');
    });
    if (batch.length) draw(batch);
  }, { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });

  edges.forEach((edge, rule) => {
    // Already scrolled past (reload mid-page, anchor jump): show it without replaying.
    if (rule.getBoundingClientRect()[edge] <= 0) rule.classList.add('is-drawn', 'rule-instant');
    else observer.observe(rule);
  });

  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    edges.forEach((_, rule) => rule.classList.add('is-drawn', 'rule-instant'));
  });
}
