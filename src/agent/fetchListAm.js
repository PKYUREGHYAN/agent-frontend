import { AUTH_API_URL } from "../services/api.js";

export async function fetchListAmListing(url) {
    const origin = AUTH_API_URL.replace(/\/api\/auth$/, "");
    const response = await fetch(`${origin}/api/listam/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
        throw new Error(data.message || "List.am-ից տվյալները չհաջողվեց ստանալ");
    }

    return data.listing;
}
