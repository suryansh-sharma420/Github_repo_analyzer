// Central place for the backend base URL so it can be configured per
// environment (e.g. VITE_API_BASE) instead of hard-coding localhost everywhere.
export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:8000';

export const apiUrl = (path) => `${API_BASE}${path}`;
