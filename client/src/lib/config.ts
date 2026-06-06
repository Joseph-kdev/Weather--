/**
 * Get the server URL from environment variables
 * Vite prefixes client environment variables with VITE_
 */
export function getServerUrl(): string {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  if (!serverUrl) {
    console.warn(
      "VITE_SERVER_URL environment variable is not set. Using current origin as fallback."
    );
    return window.location.origin;
  }
  
  return serverUrl.replace(/\/$/, ""); // Remove trailing slash if present
}

/**
 * Build a full API URL from an endpoint path
 */
export function buildApiUrl(endpoint: string): string {
  const serverUrl = getServerUrl();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${serverUrl}${path}`;
}
