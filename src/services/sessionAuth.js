import { AUTH_API_URL } from "./api.js";
import { kickExpiredSession } from "./uiSession.js";

let refreshInFlight = null;

function tokenStorage() {
    if (localStorage.getItem("refreshToken")) {
        return localStorage;
    }

    if (sessionStorage.getItem("refreshToken")) {
        return sessionStorage;
    }

    if (localStorage.getItem("accessToken")) {
        return localStorage;
    }

    return sessionStorage;
}

export function getAccessToken() {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
}

export function getRefreshToken() {
    return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
}

function accessTokenExpiresAt(token) {
    if (!token) {
        return 0;
    }

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        return payload.exp ? payload.exp * 1000 : 0;
    } catch {
        return 0;
    }
}

function saveSession(accessToken, refreshToken, user) {
    const store = tokenStorage();
    const other = store === localStorage ? sessionStorage : localStorage;

    if (accessToken) {
        store.setItem("accessToken", accessToken);
        other.removeItem("accessToken");
    }

    if (refreshToken) {
        store.setItem("refreshToken", refreshToken);
        other.removeItem("refreshToken");
    }

    if (user) {
        store.setItem("currentUser", JSON.stringify(user));
        other.removeItem("currentUser");
    }
}

export async function refreshSession() {
    if (refreshInFlight) {
        return refreshInFlight;
    }

    refreshInFlight = (async () => {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            return { ok: false, invalid: true };
        }

        try {
            const response = await fetch(`${AUTH_API_URL}/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success || !data.accessToken) {
                const invalid = response.status === 401;

                if (invalid) {
                    const hadUser = Boolean(
                        localStorage.getItem("currentUser") ||
                        sessionStorage.getItem("currentUser")
                    );

                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    sessionStorage.removeItem("accessToken");
                    sessionStorage.removeItem("refreshToken");

                    if (hadUser) {
                        kickExpiredSession();
                    } else {
                        localStorage.removeItem("currentUser");
                        sessionStorage.removeItem("currentUser");
                    }
                }

                return {
                    ok: false,
                    invalid,
                };
            }

            saveSession(data.accessToken, data.refreshToken, data.user);
            return { ok: true, invalid: false };
        } catch {
            return { ok: false, invalid: false };
        }
    })().finally(() => {
        refreshInFlight = null;
    });

    return refreshInFlight;
}

export async function ensureAccessToken() {
    const token = getAccessToken();
    const expiresAt = accessTokenExpiresAt(token);

    if (token && expiresAt > Date.now() + 20 * 1000) {
        return token;
    }

    const result = await refreshSession();
    return result.ok ? getAccessToken() : null;
}

export async function authFetch(url, options = {}) {
    const token = await ensureAccessToken();

    if (!token) {
        kickExpiredSession();
        return {
            ok: false,
            status: 401,
            json: async () => ({
                success: false,
                message: "Մուտք գործեք նորից",
            }),
        };
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);

    let response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status !== 401) {
        return response;
    }

    const refreshed = await refreshSession();

    if (!refreshed.ok) {
        if (refreshed.invalid) {
            kickExpiredSession();
        }

        return response;
    }

    headers.set("Authorization", `Bearer ${getAccessToken()}`);
    return fetch(url, {
        ...options,
        headers,
    });
}

export function startSessionKeepAlive() {
    const tick = () => {
        if (getRefreshToken()) {
            ensureAccessToken();
        }
    };

    tick();

    const intervalId = window.setInterval(tick, 10 * 60 * 1000);

    const onVisible = () => {
        if (!document.hidden) {
            tick();
        }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
        window.clearInterval(intervalId);
        document.removeEventListener("visibilitychange", onVisible);
    };
}
