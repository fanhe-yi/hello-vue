const WEB_VISITOR_KEY = "fanhe_web_tool_visitor_id";

function randomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (n) => n.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getWebVisitorId() {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(WEB_VISITOR_KEY);
    if (existing) return existing;
    const next = randomId().replace(/[^a-zA-Z0-9_-]/g, "");
    window.localStorage.setItem(WEB_VISITOR_KEY, next);
    return next;
  } catch (err) {
    return randomId().replace(/[^a-zA-Z0-9_-]/g, "");
  }
}
