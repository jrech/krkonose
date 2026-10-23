// Address combobox + coverage form (WAI-ARIA combobox with listbox popup, aria-activedescendant).
// Works in two modes:
// - no lookup client (today): plain labelled input, submit leads to manual verification;
// - with a client: debounced suggestions, keyboard selection, server-side coverage check.
// A town picked on the map (setPlace) fills the field and answers for the town as a whole.
import type { AddressLookupClient } from './client';
import type { AddressSuggestion, CoverageCheckResponse, CoverageStatus } from './types';

export interface ResultCopy { title: string; text: string }
/** Result for a town picked on the map; `primary` shows the yellow inquiry CTA instead of the plain link. */
export interface PlaceResult extends ResultCopy { kind: string; link: string; primary: boolean }
export type ResultKey = CoverageStatus | 'not_configured' | 'not_selected' | 'failed';

interface Options {
  root: HTMLElement;
  client: AddressLookupClient | null;
  copy: Record<ResultKey, ResultCopy>;
  /** Called with text that will be attached to the inquiry. It is never treated as verified. */
  onAddress?: (address: string, verified: boolean) => void;
  /** Called when the visitor starts typing, so a town picked on the map can be released. */
  onEdit?: () => void;
}

const DEBOUNCE_MS = 250;
const MIN_QUERY = 3;

export function initAddressSearch({ root, client, copy, onAddress, onEdit }: Options) {
  const form = root.querySelector<HTMLFormElement>('form')!;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const popup = root.querySelector<HTMLElement>('[data-popup]')!;
  const listbox = root.querySelector<HTMLUListElement>('[role="listbox"]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const announcer = root.querySelector<HTMLElement>('[data-announcer]')!;
  const result = root.querySelector<HTMLElement>('[data-result]')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  // Change only the inner label: the button keeps its .button-label roll markup.
  const submitText = submit.querySelector<HTMLElement>('.button-label-text') ?? submit;
  const submitLabel = submitText.textContent;
  const resultLink = result.querySelector<HTMLAnchorElement>('[data-result-link]')!;
  const resultLinkLabel = resultLink.textContent;
  const resultCta = result.querySelector<HTMLAnchorElement>('[data-result-cta]')!;
  const resultCtaText = resultCta.querySelector<HTMLElement>('.button-label-text')!;
  let placePicked = false;

  let suggestions: AddressSuggestion[] = [];
  let active = -1;
  let selected: AddressSuggestion | null = null;
  let timer: number | undefined;
  let pending: AbortController | undefined;

  if (client) {
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', listbox.id);
    input.autocomplete = 'off';
  }

  function setState(state: 'idle' | 'loading' | 'results' | 'empty' | 'error' | 'selected') {
    root.dataset.state = state;
    const open = state === 'loading' || state === 'results' || state === 'empty' || state === 'error';
    popup.hidden = !open;
    input.setAttribute('aria-expanded', String(state === 'results'));
    status.textContent = state === 'loading' ? 'Hledám adresy…'
      : state === 'empty' ? 'Adresu jsme nenašli. Zkuste přidat obec, nebo pokračujte bez ověření.'
      : state === 'error' ? 'Našeptávač teď nefunguje. Adresu můžete odeslat a ověříme ji ručně.'
      : '';
    status.hidden = !status.textContent;
    if (state === 'empty' || state === 'error') announcer.textContent = status.textContent;
    if (state !== 'results') setActive(-1);
  }

  function setActive(index: number) {
    active = index;
    listbox.querySelectorAll<HTMLElement>('[role="option"]').forEach((option, i) => option.setAttribute('aria-selected', String(i === index)));
    const option = index >= 0 ? listbox.children[index] as HTMLElement : null;
    if (option) {
      input.setAttribute('aria-activedescendant', option.id);
      // Scroll only the popup, never the page.
      if (option.offsetTop < popup.scrollTop) popup.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > popup.scrollTop + popup.clientHeight) popup.scrollTop = option.offsetTop + option.offsetHeight - popup.clientHeight;
    }
    else input.removeAttribute('aria-activedescendant');
  }

  function render(list: AddressSuggestion[]) {
    suggestions = list;
    listbox.replaceChildren(...list.map((item, i) => {
      const option = document.createElement('li');
      option.id = `${listbox.id}-${i}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      const label = document.createElement('span');
      label.textContent = item.label;
      option.append(label);
      if (item.detail) {
        const detail = document.createElement('span');
        detail.className = 'option-detail';
        detail.textContent = item.detail;
        option.append(detail);
      }
      return option;
    }));
    setState(list.length ? 'results' : 'empty');
    announcer.textContent = list.length ? `${list.length} ${list.length === 1 ? 'návrh' : list.length < 5 ? 'návrhy' : 'návrhů'} adres. Vyberte šipkami.` : '';
  }

  function choose(index: number) {
    const item = suggestions[index];
    if (!item) return;
    selected = item;
    input.value = item.label;
    setState('selected');
    announcer.textContent = `Vybráno: ${item.label}`;
  }

  async function lookup(query: string) {
    pending?.abort();
    pending = new AbortController();
    setState('loading');
    try {
      render(await client!.suggest(query, pending.signal));
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setState('error');
    }
  }

  function renderResult({ title, text, kind, link, primary }: PlaceResult) {
    result.querySelector<HTMLElement>('[data-result-title]')!.textContent = title;
    result.querySelector<HTMLElement>('[data-result-text]')!.textContent = text;
    resultCta.hidden = !primary;
    resultCtaText.textContent = link;
    resultLink.hidden = primary;
    resultLink.textContent = link;
    result.dataset.kind = kind;
    result.hidden = false;
  }

  function showResult(key: ResultKey, address?: string) {
    const { title, text } = copy[key];
    renderResult({ title, text: address ? `${address}. ${text}` : text, kind: key, link: resultLinkLabel ?? '', primary: false });
  }

  /** Fills the field with a town picked on the map and shows that town's answer. */
  function setPlace(name: string, answer: PlaceResult) {
    pending?.abort();
    window.clearTimeout(timer);
    selected = null;
    placePicked = true;
    input.value = name;
    input.setCustomValidity('');
    setState('idle');
    onAddress?.(name, false);
    renderResult(answer);
    // On phones the form sits above the map: bring the answer into view if it is off screen.
    const box = result.getBoundingClientRect();
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
    if (box.top < headerHeight || box.bottom > innerHeight) {
      result.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  input.addEventListener('input', () => {
    selected = null;
    if (placePicked) { placePicked = false; onEdit?.(); }
    input.setCustomValidity('');
    result.hidden = true;
    if (!client) return;
    window.clearTimeout(timer);
    const query = input.value.trim();
    if (query.length < MIN_QUERY) { pending?.abort(); setState('idle'); return; }
    timer = window.setTimeout(() => lookup(query), DEBOUNCE_MS);
  });

  input.addEventListener('keydown', event => {
    if (!client) return;
    const open = root.dataset.state === 'results';
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!open) { if (suggestions.length) setState('results'); return; }
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((active + step + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && open && active >= 0) {
      event.preventDefault();
      choose(active);
    } else if (event.key === 'Escape' && !popup.hidden) {
      event.preventDefault();
      setState('idle');
    }
  });

  // pointerdown keeps focus in the input; click does the selection.
  listbox.addEventListener('pointerdown', event => event.preventDefault());
  listbox.addEventListener('click', event => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (option) choose([...listbox.children].indexOf(option));
    input.focus();
  });
  listbox.addEventListener('pointermove', event => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (option) setActive([...listbox.children].indexOf(option));
  });
  input.addEventListener('blur', () => { if (root.dataset.state !== 'selected') setState('idle'); });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) { input.setCustomValidity('Doplňte adresu nebo obec provozovny.'); input.reportValidity(); return; }
    setState(selected ? 'selected' : 'idle');

    // Typed text is passed on as an unverified note; only a resolved suggestion gets checked.
    if (!client) { onAddress?.(text, false); showResult('not_configured'); return; }
    if (!selected) { onAddress?.(text, false); showResult('not_selected'); return; }

    submit.disabled = true;
    submitText.textContent = 'Ověřuji…';
    root.setAttribute('aria-busy', 'true');
    try {
      const { address, coverage }: CoverageCheckResponse = await client.check(selected.id);
      onAddress?.(address.label, coverage.status !== 'unknown');
      showResult(coverage.status, address.label);
    } catch {
      onAddress?.(text, false);
      showResult('failed');
    } finally {
      submit.disabled = false;
      submitText.textContent = submitLabel;
      root.removeAttribute('aria-busy');
    }
  });

  return { setPlace };
}
