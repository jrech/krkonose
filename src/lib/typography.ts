// Czech typography: no one-letter prepositions/conjunctions (v, k, s, z, o, u, a, i) left hanging at
// the end of a line, and numbers stay with the number or unit that follows (phone, PSČ, "12 kg").
// Applied to every rendered page by src/middleware.ts and to client-side copy (coverage-copy.ts).
const NBSP = ' ';
const ONE_LETTER = /(?<=^|[\s („"“'‚\-–—/])([ksvzouaiKSVZOUAI]) (?=\S)/g;
const DIGIT_GROUP = /(?<=\d) (?=\d)/g;
const NUMBER_UNIT = /(?<=\d) (?=(?:%|Kč|kg|ks|km|m²|min|h|dní|dny|let|°C)(?![\p{L}\d]))/gu;
const SECTION_SIGN = /(?<=§) (?=\d)/g;

export function noOrphans(text: string): string {
  if (!text || !text.includes(' ')) return text;
  return text.replace(ONE_LETTER, `$1${NBSP}`).replace(DIGIT_GROUP, NBSP).replace(NUMBER_UNIT, NBSP).replace(SECTION_SIGN, NBSP);
}

// Text nodes only: tags, attributes, comments and the contents of script/style/textarea/pre are left alone.
// Raw-text and code elements are kept whole (their content may hold "<" that isn't a tag, e.g. CSS
// "width<=600px"); comments and real tags pass through; only the text between them is touched.
const TOKENS = /(<(script|style|textarea|pre|code)\b[\s\S]*?<\/\2\s*>|<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>)/gi;

export function noOrphansHtml(html: string): string {
  let out = '';
  let last = 0;
  for (const match of html.matchAll(TOKENS)) {
    out += noOrphans(html.slice(last, match.index)) + match[0];
    last = match.index! + match[0].length;
  }
  return out + noOrphans(html.slice(last));
}
