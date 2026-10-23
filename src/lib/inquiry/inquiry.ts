// Inquiry form logic shared by the Kontakt page. There is no backend yet: without
// PUBLIC_INQUIRY_ENDPOINT the inquiry is handed to the visitor's e-mail app as a prepared message,
// and the page says so honestly instead of claiming it was sent.

export interface Inquiry {
  name: string;
  contact: string;
  locality: string;
  operation: string;
  details: string;
}

export type InquiryField = keyof Inquiry;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Czech and international numbers: optional +, then 9–15 digits separated by spaces, dots or dashes.
const phonePattern = /^\+?[\d\s().-]{9,20}$/;

export function contactKind(value: string): 'email' | 'phone' | null {
  const trimmed = value.trim();
  if (emailPattern.test(trimmed)) return 'email';
  const digits = trimmed.replace(/\D/g, '');
  if (phonePattern.test(trimmed) && digits.length >= 9 && digits.length <= 15) return 'phone';
  return null;
}

export function validateInquiry(inquiry: Inquiry): InquiryErrors {
  const errors: InquiryErrors = {};
  if (inquiry.name.trim().length < 2) errors.name = 'Napište prosím, jak vás oslovit.';
  if (!inquiry.contact.trim()) errors.contact = 'Vyplňte telefon nebo e-mail, abychom se vám mohli ozvat.';
  else if (!contactKind(inquiry.contact)) errors.contact = 'Zkontrolujte prosím telefon (např. 773 123 456) nebo e-mail (např. jana@penzion.cz).';
  if (inquiry.locality.trim().length < 2) errors.locality = 'Uveďte obec nebo adresu provozu, abychom mohli ověřit svoz.';
  return errors;
}

export function formatInquiry(inquiry: Inquiry): { subject: string; body: string } {
  const subject = `Poptávka spolupráce${inquiry.operation ? ` — ${inquiry.operation}` : ''}`;
  const body = [
    'Dobrý den,', '', 'máme zájem o spolupráci.', '',
    `Jméno / provozovna: ${inquiry.name.trim()}`,
    `Kontakt: ${inquiry.contact.trim()}`,
    `Obec / adresa provozu: ${inquiry.locality.trim()}`,
    `Typ provozu: ${inquiry.operation || 'neuvedeno'}`,
    `Co potřebujeme prát: ${inquiry.details.trim() || 'neuvedeno'}`,
    '', 'Děkuji.',
  ].join('\n');
  return { subject, body };
}

export type InquiryResult = { delivery: 'sent' } | { delivery: 'mail-app'; href: string };

export interface InquiryTransport {
  submit(inquiry: Inquiry): Promise<InquiryResult>;
}

export function createHttpTransport(endpoint: string): InquiryTransport {
  return {
    async submit(inquiry) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(inquiry),
      });
      if (!response.ok) throw new Error(`Inquiry API ${response.status}`);
      return { delivery: 'sent' };
    },
  };
}

export function createMailtoTransport(email: string): InquiryTransport {
  return {
    async submit(inquiry) {
      const { subject, body } = formatInquiry(inquiry);
      return { delivery: 'mail-app', href: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
    },
  };
}

/** Uses the HTTP endpoint once it is deployed and configured, otherwise the e-mail fallback. */
export function getInquiryTransport(fallbackEmail: string): InquiryTransport {
  const endpoint = import.meta.env.PUBLIC_INQUIRY_ENDPOINT;
  return typeof endpoint === 'string' && endpoint.trim() ? createHttpTransport(endpoint.trim()) : createMailtoTransport(fallbackEmail);
}
