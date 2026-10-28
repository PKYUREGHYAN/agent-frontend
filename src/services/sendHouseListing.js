import { TELEGRAM_API_URL } from "./api.js";
import { authFetch } from "./sessionAuth.js";

function showSentNotice() {
    document.querySelector(".send-success-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "send-success-overlay";
    overlay.innerHTML = `
        <div class="send-success-card">
            <div class="send-success-icon">✓</div>
            <h3>Ուղարկվել է</h3>
            <p>Հայտարարությունը գնաց տելեգրամի ալիք</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function openTelegram(url) {
    if (!url) {
        return;
    }

    window.location.href = url;
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
    });
}

async function compressToBlob(dataUrl) {
    const image = await loadImage(dataUrl);
    const maxSize = 1280;
    let { width, height } = image;

    if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);

    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => resolve(blob),
            "image/jpeg",
            0.72
        );
    });
}

function photoUrls(data) {
    const raw = data?.uploadedPhotos || data?.photos || [];

    if (!Array.isArray(raw)) {
        return [];
    }

    return raw
        .map((item) => (typeof item === "string" ? item : item?.url || item?.original || item?.cleaned))
        .filter((item) => typeof item === "string" && item.startsWith("data:image"))
        .slice(0, 10);
}

export async function sendHouseListing(listingType, data) {
    const payload = { ...(data || {}) };
    delete payload.uploadedPhotos;
    delete payload.photos;

    const form = new FormData();
    form.append("listingType", listingType);
    form.append("data", JSON.stringify(payload));

    const urls = photoUrls(data);

    for (const [index, url] of urls.entries()) {
        try {
            const blob = await compressToBlob(url);
            if (blob) {
                form.append("photos", blob, `photo-${index}.jpg`);
            }
        } catch {
            // skip broken image
        }
    }

    const response = await authFetch(`${TELEGRAM_API_URL}/send`, {
        method: "POST",
        body: form,
    });

    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
        return result;
    }

    if (!result.success) {
        return result;
    }

    showSentNotice();
    window.setTimeout(() => {
        openTelegram(result.chatUrl);
    }, 1600);

    return result;
}
