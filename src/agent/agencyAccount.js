import { AGENCY_API_URL } from "../services/api.js";

export const AGENCY_SESSION_KEY = "agent1_agency_session";

export function isGmailAddress(email) {
    return /^[^\s@]+@gmail\.com$/i.test(String(email || "").trim());
}

export function isListAmHouseUrl(value) {
    const text = String(value || "").trim();
    return /^https?:\/\/(www\.)?list\.am\/(?:[a-z]{2}\/)?item\/\d+/i.test(text);
}

export function getAgencySession() {
    try {
        const raw = localStorage.getItem(AGENCY_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveAgencySession(session) {
    localStorage.setItem(AGENCY_SESSION_KEY, JSON.stringify(session));
}

export function clearAgencySession() {
    localStorage.removeItem(AGENCY_SESSION_KEY);
}

function toSession(agent) {
    return {
        userId: agent.id,
        email: agent.email,
        firstId: agent.firstId,
        secondId: agent.secondId,
        remainingListings: Number(agent.remainingListings || 0),
        activePackageId: agent.activePackageId || null,
        activePackageName: agent.activePackageName || "",
        createdAt: agent.createdAt || agent.registeredDate,
    };
}

export async function sendAgencyKeysToGmail(email) {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!isGmailAddress(cleanEmail)) {
        return { ok: false, message: "Գրեք ձեր անձնական Gmail հասցեն" };
    }

    try {
        const response = await fetch(`${AGENCY_API_URL}/keys/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
            return { ok: false, message: data.message || "Կոդը չհաջողվեց ուղարկել Gmail" };
        }
        return { ok: true, message: data.message };
    } catch {
        return { ok: false, message: "Կոդը չհաջողվեց ուղարկել Gmail" };
    }
}

export async function loginWithFirstId(firstId) {
    try {
        const response = await fetch(`${AGENCY_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstId: String(firstId || "").trim() }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.agent) {
            return null;
        }
        const session = toSession(data.agent);
        saveAgencySession(session);
        return session;
    } catch {
        return null;
    }
}

export async function refreshAgencySession() {
    const session = getAgencySession();
    if (!session?.firstId) {
        return null;
    }

    try {
        const response = await fetch(
            `${AGENCY_API_URL}/me?firstId=${encodeURIComponent(session.firstId)}`
        );
        const data = await response.json().catch(() => ({}));
        if (response.status === 404) {
            clearAgencySession();
            return null;
        }
        if (!response.ok || !data.agent) {
            return session;
        }
        const next = toSession(data.agent);
        saveAgencySession(next);
        return next;
    } catch {
        return session;
    }
}

export async function consumeAgencySearch() {
    const session = getAgencySession();
    if (!session?.firstId) {
        return { ok: false, remaining: 0, empty: true };
    }

    try {
        const response = await fetch(`${AGENCY_API_URL}/consume`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstId: session.firstId }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
            saveAgencySession({ ...session, remainingListings: 0 });
            return { ok: false, remaining: 0, empty: true };
        }
        const remaining = Number(data.remaining || 0);
        saveAgencySession({ ...session, remainingListings: remaining });
        return { ok: true, remaining, empty: remaining <= 0 };
    } catch {
        return { ok: false, remaining: 0, empty: true };
    }
}

export async function persistAgencyListing(listing, email) {
    try {
        await fetch(`${AGENCY_API_URL}/listings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listing, email }),
        });
    } catch {
        // keep local copy even if API fails
    }
}

export function publicShareUrl(token) {
    return `${window.location.origin}/?share=${encodeURIComponent(token)}`;
}

export async function createShareLink(kind, listing) {
    const session = getAgencySession();
    const response = await fetch(`${AGENCY_API_URL}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            kind,
            listing,
            email: session?.email || null,
        }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.share) {
        throw new Error(data.message || "Հղումը չհաջողվեց ստեղծել");
    }
    return {
        ...data.share,
        url: publicShareUrl(data.share.token),
        appUrl: data.share.appUrl || `agent1://share/${data.share.token}`,
    };
}
