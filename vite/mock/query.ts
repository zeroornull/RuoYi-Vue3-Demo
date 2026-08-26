export function parseMockQuery(url: string): Record<string, string> {
  const qIndex = url.indexOf("?");
  if (qIndex < 0) {
    return {};
  }
  const params = new URLSearchParams(url.slice(qIndex + 1));
  const query: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    query[key] = value;
  }
  return query;
}