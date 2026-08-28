import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.detail || err.message || "Unknown API error";
    return Promise.reject(new Error(message));
  },
);

export default client;
