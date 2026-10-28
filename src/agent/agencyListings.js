const LISTINGS_KEY = "agent1_agency_listings_v1";
const CURRENT_KEY = "agent1_agency_current_listing";

function readListings() {
    try {
        const raw = localStorage.getItem(LISTINGS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeListings(listings) {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

export function saveAgencyListing(listing) {
    if (!listing?.id) {
        return listing;
    }

    const listings = readListings().filter((item) => item.id !== listing.id);
    writeListings([listing, ...listings].slice(0, 50));
    localStorage.setItem(CURRENT_KEY, JSON.stringify(listing));
    sessionStorage.setItem("current_listing_data", JSON.stringify(listing));
    return listing;
}

export function getCurrentAgencyListing() {
    try {
        const raw =
            localStorage.getItem(CURRENT_KEY) ||
            sessionStorage.getItem("current_listing_data");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function updateSavedAgencyListing(listing) {
    return saveAgencyListing(listing);
}
