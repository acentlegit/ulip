// API Configuration
// In production, this will use the EC2 IP address
// In development, it will use localhost

const getApiBaseUrl = () => {
  // Check for environment variable first (for production builds)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }
  
  // Production default - use EC2 IP
  return "http://35.170.56.29:5000";
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/api/${cleanEndpoint}`;
};

export default API_BASE_URL;
