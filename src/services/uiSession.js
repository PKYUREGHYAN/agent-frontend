import { useEffect, useRef, useState } from "react";

const PREFIX = "agent1_";
export const PAGE_KEY = `${PREFIX}current_page`;
export const PROPERTY_TYPE_KEY = `${PREFIX}property_type`;
const LOGIN_DRAFT_KEY = `${PREFIX}login_draft`;
const REGISTER_DRAFT_KEY = `${PREFIX}register_draft`;
const PHOTO_FIELDS = new Set(["uploadedPhotos", "photos"]);
const DB_NAME = "agent1_ui";
const STORE_NAME = "blobs";

export const AUTH_PAGES = new Set([
    "login",
    "register",
    "activation",
    "main-menu",
    "property-type",
    "apartment-rent",
    "house-rent",
    "long-term-apartment",
    "long-term-house",
    "daily-apartment",
    "daily-house",
    "apartment-sale",
    "house-sale",
    "sale-apartment",
    "sale-house",
    "agency-home",
    "agency-listing",
    "agency-photos",
    "agency-card",
]);

function migrateSessionToLocal() {
    try {
        for (let index = 0; index < sessionStorage.length; index += 1) {
            const key = sessionStorage.key(index);
            if (key && key.startsWith(PREFIX) && localStorage.getItem(key) == null) {
                localStorage.setItem(key, sessionStorage.getItem(key));
            }
        }
    } catch {
        // ignore
    }
}

migrateSessionToLocal();

export function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
        if (raw == null) {
            return fallback;
        }
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function writeJson(key, value) {
    const raw = JSON.stringify(value);

    try {
        localStorage.setItem(key, raw);
        return true;
    } catch {
        try {
            const { photos, uploadedPhotos, ...rest } = value || {};
            localStorage.setItem(key, JSON.stringify(rest));
        } catch {
            return false;
        }
        return false;
    }
}

function openUiDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveBlob(key, value) {
    const db = await openUiDb();

    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    db.close();
}

export async function loadBlob(key) {
    const db = await openUiDb();

    const value = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    db.close();
    return value;
}

async function clearBlobs() {
    const db = await openUiDb();

    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    db.close();
}

function withoutPhotoFields(values) {
    const rest = { ...(values || {}) };
    PHOTO_FIELDS.forEach((field) => {
        delete rest[field];
    });
    return rest;
}

export function loadFormDraft(formId) {
    return readJson(`${PREFIX}form_${formId}`, {}) || {};
}

export function useSaveFormDraft(formId, values) {
    const rest = withoutPhotoFields(values);
    const serialized = JSON.stringify(rest);

    useEffect(() => {
        writeJson(`${PREFIX}form_${formId}`, JSON.parse(serialized));
    }, [formId, serialized]);
}

export function useFormDraftState(formId, field, initial) {
    const storageKey = `${PREFIX}form_${formId}_${field}`;
    const [value, setValue] = useState(initial || []);
    const readyRef = useRef(false);
    const touchedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        loadBlob(storageKey)
            .then((saved) => {
                if (cancelled) {
                    return;
                }
                if (
                    !touchedRef.current &&
                    Array.isArray(saved) &&
                    saved.length > 0
                ) {
                    setValue(saved);
                }
                readyRef.current = true;
            })
            .catch(() => {
                readyRef.current = true;
            });

        return () => {
            cancelled = true;
        };
    }, [storageKey]);

    useEffect(() => {
        if (!readyRef.current && !touchedRef.current) {
            return;
        }

        saveBlob(storageKey, value).catch(() => {});
    }, [storageKey, value]);

    const setDraftValue = (next) => {
        touchedRef.current = true;
        readyRef.current = true;
        setValue(next);
    };

    return [value, setDraftValue];
}

export function usePersistentState(key, fallback) {
    const storageKey = `${PREFIX}${key}`;
    const [value, setValue] = useState(() => readJson(storageKey, fallback));
    const serialized = JSON.stringify(value);

    useEffect(() => {
        writeJson(storageKey, JSON.parse(serialized));
    }, [storageKey, serialized]);

    return [value, setValue];
}

export function usePageScroll(page) {
    useEffect(() => {
        const scrollKey = `${PREFIX}scroll_${page}`;
        const savedY = Number(localStorage.getItem(scrollKey) || 0);

        const restore = () => {
            window.scrollTo(0, savedY);
        };

        restore();
        const timer = window.setTimeout(restore, 50);

        const onScroll = () => {
            localStorage.setItem(scrollKey, String(window.scrollY || 0));
        };

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("scroll", onScroll);
        };
    }, [page]);
}

export function filesToDataUrls(files) {
    return Promise.all(
        Array.from(files || []).map(
            (file) =>
                new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(
                            typeof reader.result === "string" ? reader.result : ""
                        );
                    };
                    reader.onerror = () => resolve("");
                    reader.readAsDataURL(file);
                })
        )
    ).then((urls) => urls.filter(Boolean));
}

export function filesToPhotoCards(files) {
    return Promise.all(
        Array.from(files || []).map(
            (file) =>
                new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve({
                            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                            name: file.name,
                            url: typeof reader.result === "string" ? reader.result : "",
                            size: (file.size / 1024 / 1024).toFixed(2),
                        });
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                })
        )
    ).then((photos) => photos.filter((photo) => photo && photo.url));
}

export function loadLoginDraft() {
    return readJson(LOGIN_DRAFT_KEY, {}) || {};
}

export function saveLoginDraft(draft) {
    writeJson(LOGIN_DRAFT_KEY, draft);
}

export function loadRegisterDraft() {
    return readJson(REGISTER_DRAFT_KEY, {}) || {};
}

export function saveRegisterDraft(draft) {
    writeJson(REGISTER_DRAFT_KEY, draft);
}

export function readSavedPage(isLoggedIn) {
    const saved =
        localStorage.getItem(PAGE_KEY) || sessionStorage.getItem(PAGE_KEY);

    if (!isLoggedIn) {
        return saved === "register" ? "register" : "login";
    }

    if (saved && AUTH_PAGES.has(saved) && saved !== "login" && saved !== "register") {
        return saved;
    }

    return "main-menu";
}

export function saveCurrentPage(page) {
    try {
        localStorage.setItem(PAGE_KEY, page);
        sessionStorage.setItem(PAGE_KEY, page);
    } catch {
        // ignore
    }
}

export function clearUiSession() {
    const keys = new Set();

    [localStorage, sessionStorage].forEach((storage) => {
        for (let index = 0; index < storage.length; index += 1) {
            const key = storage.key(index);
            if (key && key.startsWith(PREFIX)) {
                keys.add(key);
            }
        }
    });

    keys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });

    clearBlobs().catch(() => {});
}

export function kickExpiredSession() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    window.location.replace("/");
}
