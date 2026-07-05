export const API_VERSION = 1;

export function jsonEnvelope(type, data) {
  return JSON.stringify({ apiVersion: API_VERSION, type, data }, null, 2);
}

export function jsonErrorEnvelope(message, code = 'ERR_UNKNOWN', suggestions = undefined) {
  const payload = { apiVersion: API_VERSION, error: message, code };
  if (suggestions) payload.suggestions = suggestions;
  return JSON.stringify(payload, null, 2);
}
