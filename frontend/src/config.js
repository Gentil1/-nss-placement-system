// Centralized API base URL.
// - Local development: falls back to http://localhost:5000/api automatically.
// - Production (Vercel/Netlify): set VITE_API_BASE_URL in your hosting
//   provider's environment variables to your deployed backend's URL,
//   e.g. https://your-backend.onrender.com/api
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
