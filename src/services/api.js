function serviceOrigin(port, envValue) {
    if (envValue) {
        return String(envValue).replace(/\/$/, "");
    }

    if (typeof window === "undefined") {
        return `http://127.0.0.1:${port}`;
    }

    if (Number(port) === 8000) {
        return `${window.location.protocol}//${window.location.hostname}:8000`;
    }

    const pagePort = window.location.port;
    if (!pagePort || pagePort === String(port)) {
        return window.location.origin;
    }

    return `${window.location.protocol}//${window.location.hostname}:${port}`;
}

export const AUTH_API_URL = `${serviceOrigin(5000, import.meta.env.VITE_AUTH_API_URL)}/api/auth`;
export const AI_API_URL = `${serviceOrigin(8000, import.meta.env.VITE_AI_API_URL)}/api/ai`;
export const TELEGRAM_API_URL = `${serviceOrigin(5000, import.meta.env.VITE_AUTH_API_URL)}/api/telegram`;
export const AGENCY_API_URL = `${serviceOrigin(5000, import.meta.env.VITE_AUTH_API_URL)}/api/agency`;
export const ADMIN_API_URL = `${serviceOrigin(5000, import.meta.env.VITE_AUTH_API_URL)}/api/admin`;
