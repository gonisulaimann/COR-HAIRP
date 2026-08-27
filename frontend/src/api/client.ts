/**
 * client.ts — Typed Axios instance for COR-HARP API communication.
 *
 * TEMP-DOCS: This module creates a pre-configured Axios client that
 * automatically prefixes all requests with /api and sets JSON headers.
 * The Vite dev server proxies /api → localhost:8000 (see vite.config.ts).
 */
import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// TEMP-DOCS: Response interceptor extracts .data automatically and
// normalizes Axios errors into a readable message string.
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.message ||
      'Unknown API error';
    return Promise.reject(new Error(message));
  },
);

export default client;
