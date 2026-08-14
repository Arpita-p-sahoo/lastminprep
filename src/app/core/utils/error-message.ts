const TECHNICAL_PATTERN = /http failure|xmlhttprequest|networkerror|unknown error|status code \d+|^\{|^\[object/i;

export function toFriendlyErrorMessage(err: any, fallback: string): string {
  const raw = err?.error?.message ?? err?.message;
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== 'string') return fallback;

  const msg = first.replace(/\s+/g, ' ').trim();
  if (!msg || msg.length > 140 || TECHNICAL_PATTERN.test(msg)) return fallback;

  return msg.charAt(0).toUpperCase() + msg.slice(1);
}
