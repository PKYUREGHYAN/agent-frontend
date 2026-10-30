import { AGENCY_API_URL } from "../services/api.js";

/** Empty until /catalog loads from SQLite. Do not hardcode business prices here. */
export const PACKAGES = [];

export async function fetchAgencyCatalog() {
    try {
        const response = await fetch(`${AGENCY_API_URL}/catalog`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { packages: [], discountPercent: 0 };
        }
        return {
            packages: Array.isArray(data.packages) ? data.packages : [],
            discountPercent: Number(data.discountPercent || 0),
        };
    } catch {
        return { packages: [], discountPercent: 0 };
    }
}
