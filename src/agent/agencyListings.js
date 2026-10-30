const CURRENT_KEY = "agent1_agency_current_listing";

/**
 * In-session navigation cache only.
 * Source of truth for agency listings is SQLite via /api/agency/listings.
 */
export function saveAgencyListing(listing) {
    if (!listing?.id) {
        return listing;
    }

    try {
        sessionStorage.setItem(CURRENT_KEY, JSON.stringify(listing));
    } catch {
        // ignore quota
    }
    return listing;
}

export function getCurrentAgencyListing() {
    try {
        const raw = sessionStorage.getItem(CURRENT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function updateSavedAgencyListing(listing) {
    return saveAgencyListing(listing);
}

export function clearCurrentAgencyListing() {
    try {
        sessionStorage.removeItem(CURRENT_KEY);
    } catch {
        // ignore
    }
}
