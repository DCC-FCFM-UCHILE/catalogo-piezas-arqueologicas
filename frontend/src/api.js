const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    // In production, use the same origin (assuming nginx is routing properly)
    return "";
  }
  // In development, use localhost
  return "http://localhost:8000";
};

export const API_URLS = {
  AUTH: `${getBaseUrl()}/api/auth/`,
  ALL_ARTIFACTS: `${getBaseUrl()}/api/catalog/artifacts`,
  DETAILED_ARTIFACT: `${getBaseUrl()}/api/catalog/artifact`,
  ALL_METADATA: `${getBaseUrl()}/api/catalog/metadata`,
  ALL_INSTITUTIONS: `${getBaseUrl()}/api/catalog/institutions`,
  BASE: `${getBaseUrl()}`,
};
